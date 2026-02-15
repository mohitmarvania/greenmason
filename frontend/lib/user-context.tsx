"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createUser, getUser, type User } from "./api";

interface UserContextType {
  username: string | null;
  displayName: string | null;
  user: User | null;
  isLoading: boolean;
  setUsername: (name: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load username from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("greenmason_username");
    const storedDisplay = localStorage.getItem("greenmason_display_name");
    if (stored) {
      setUsernameState(stored);
      setDisplayName(storedDisplay || stored);
      // Fetch user data
      getUser(stored)
        .then(setUser)
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const setUsername = async (name: string) => {
    const trimmed = name.trim().toLowerCase().replace(/\s+/g, "_");
    const display = name.trim();
    localStorage.setItem("greenmason_username", trimmed);
    localStorage.setItem("greenmason_display_name", display);
    setUsernameState(trimmed);
    setDisplayName(display);
    try {
      const userData = await createUser(trimmed, display);
      setUser(userData);
    } catch {
      // User might already exist, try to get
      try {
        const userData = await getUser(trimmed);
        setUser(userData);
      } catch {
        // Offline mode - set basic user
        setUser({
          username: trimmed,
          display_name: display,
          total_score: 0,
          actions_count: 0,
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
        });
      }
    }
  };

  const refreshUser = async () => {
    if (username) {
      try {
        const userData = await getUser(username);
        setUser(userData);
      } catch {}
    }
  };

  const logout = () => {
    localStorage.removeItem("greenmason_username");
    localStorage.removeItem("greenmason_display_name");
    setUsernameState(null);
    setDisplayName(null);
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{ username, displayName, user, isLoading, setUsername, refreshUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
