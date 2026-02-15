"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/lib/user-context";
import { usePathname } from "next/navigation";
import { Leaf, Heart } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/snap", label: "Snap & Sort" },
  { href: "/chat", label: "EcoChat" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quiz", label: "EcoMatch" },
];

export default function Navbar() {
  const { displayName, user } = useUser();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-[#E8F5E9] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2E7D32] to-[#43A047]">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#2E7D32]">
            Green<span className="text-[#E91E63]">Mason</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? "bg-[#E8F5E9] text-[#2E7D32]"
                      : "text-gray-600 hover:bg-[#FCE4EC] hover:text-[#E91E63]"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* User info */}
        {displayName && (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-full bg-[#FCE4EC] px-3 py-1.5 sm:flex">
              <Heart className="h-4 w-4 fill-[#E91E63] text-[#E91E63]" />
              <span className="text-sm font-semibold text-[#E91E63]">
                {user?.total_score ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1.5">
              <Image
                src="/sprout/sprout-wave.png"
                alt="Sprout"
                width={24}
                height={24}
              />
              <span className="text-sm font-medium text-[#2E7D32]">
                {displayName}
              </span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
