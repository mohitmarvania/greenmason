"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, MessageCircle, Trophy, Heart } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/snap", label: "Snap", icon: Camera },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/dashboard", label: "Score", icon: Trophy },
  { href: "/quiz", label: "Quiz", icon: Heart },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E8F5E9] bg-white/95 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors
                ${
                  isActive
                    ? "text-[#2E7D32]"
                    : "text-gray-400 hover:text-[#E91E63]"
                }`}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "fill-[#E8F5E9]" : ""}`}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="h-1 w-1 rounded-full bg-[#2E7D32]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
