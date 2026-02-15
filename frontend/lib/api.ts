/**
 * GreenMason API Client
 * Communicates with the FastAPI backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Generic fetch helper ──

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "API request failed");
  }
  return res.json();
}

// ── Types ──

export interface ClassificationResult {
  category: string;
  confidence: string;
  item_name: string;
  disposal_instructions: string;
  gmu_tip: string;
  fun_fact: string;
  points_earned: number;
}

export interface ChatResponse {
  reply: string;
  route_to_patriotai: boolean;
  patriotai_agent: string | null;
  patriotai_reason: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface User {
  username: string;
  display_name: string;
  total_score: number;
  actions_count: number;
  rank?: number;
  created_at: string;
  last_active: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  display_name: string;
  total_score: number;
  actions_count: number;
}

export interface Pledge {
  username: string;
  display_name: string;
  pledge_text: string;
  created_at: string;
  likes: number;
}

export interface PatriotAIAgent {
  key: string;
  name: string;
  emoji: string;
  description: string;
  url: string;
  example_queries: string[];
}

export interface GlobalStats {
  total_users: number;
  total_actions: number;
  total_pledges: number;
  total_points: number;
  action_breakdown: Record<string, number>;
}

// ── API Functions ──

// Snap & Sort
export async function classifyWaste(imageBase64: string, mimeType: string = "image/jpeg"): Promise<ClassificationResult> {
  return apiFetch("/api/classify", {
    method: "POST",
    body: JSON.stringify({ image_base64: imageBase64, mime_type: mimeType }),
  });
}

// Snap & Sort — file upload version (better for large phone photos)
export async function classifyWasteFile(file: File): Promise<ClassificationResult> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/classify/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "Classification failed");
  }
  return res.json();
}

// Chat
export async function sendChatMessage(message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
  return apiFetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

// Users
export async function createUser(username: string, displayName?: string): Promise<User> {
  return apiFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({ username, display_name: displayName || username }),
  });
}

export async function getUser(username: string): Promise<User> {
  return apiFetch(`/api/users/${username}`);
}

// Scores
export async function logScore(username: string, action: string, points: number, description?: string) {
  return apiFetch("/api/scores", {
    method: "POST",
    body: JSON.stringify({ username, action, points, description }),
  });
}

// Leaderboard
export async function getLeaderboard(limit: number = 20): Promise<{ leaderboard: LeaderboardEntry[]; total_entries: number }> {
  return apiFetch(`/api/leaderboard?limit=${limit}`);
}

// Pledges
export async function createPledge(username: string, pledgeText: string): Promise<Pledge> {
  return apiFetch("/api/pledges", {
    method: "POST",
    body: JSON.stringify({ username, pledge_text: pledgeText }),
  });
}

export async function getPledges(limit: number = 50): Promise<{ pledges: Pledge[]; total: number }> {
  return apiFetch(`/api/pledges?limit=${limit}`);
}

// PatriotAI
export async function getPatriotAIAgents(): Promise<{ agents: PatriotAIAgent[] }> {
  return apiFetch("/api/patriotai/agents");
}

// Voice
export function getDailyTipAudioUrl(): string {
  return `${API_BASE}/api/voice/tip`;
}

export async function getDailyTipText(): Promise<{ tip: string }> {
  return apiFetch("/api/voice/tip/text");
}

export function getScoreSummaryAudioUrl(username: string): string {
  return `${API_BASE}/api/voice/score/${username}`;
}

// Stats
export async function getGlobalStats(): Promise<GlobalStats> {
  return apiFetch("/api/stats");
}
