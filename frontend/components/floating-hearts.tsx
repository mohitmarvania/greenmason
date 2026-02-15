"use client";

import { useState, useEffect } from "react";

interface HeartStyle {
  left: string;
  animationDelay: string;
  animationDuration: string;
  fontSize: string;
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartStyle[]>([]);

  // Generate random positions only on client side to avoid hydration mismatch
  useEffect(() => {
    const generated = Array.from({ length: 15 }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 20}s`,
      animationDuration: `${15 + Math.random() * 20}s`,
      fontSize: `${12 + Math.random() * 24}px`,
    }));
    setHearts(generated);
  }, []);

  if (hearts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {hearts.map((style, i) => (
        <div
          key={i}
          className="animate-float absolute text-[#E91E63]/10"
          style={style}
        >
          ♥
        </div>
      ))}
    </div>
  );
}
