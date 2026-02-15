"use client";

import { useState } from "react";
import { useUser } from "@/lib/user-context";
import Image from "next/image";

export default function UsernameModal() {
  const { username, isLoading, setUsername } = useUser();
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading || username) return null;

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setIsSubmitting(true);
    await setUsername(input);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        {/* Sprout mascot */}
        <div className="mb-4 flex justify-center">
          <Image
            src="/sprout/sprout-wave.png"
            alt="Sprout mascot waving"
            width={120}
            height={120}
            className="drop-shadow-lg"
          />
        </div>

        {/* Title */}
        <h2 className="mb-1 text-center text-2xl font-bold text-[#2E7D32]">
          Welcome to GreenMason!
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Fall in Love with a Greener Campus 💚
        </p>

        {/* Input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            What should we call you?
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter your name..."
            maxLength={30}
            className="w-full rounded-xl border-2 border-[#E8F5E9] px-4 py-3 text-lg
                       outline-none transition-all
                       placeholder:text-gray-400
                       focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20"
            autoFocus
          />
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#43A047]
                     px-6 py-3 text-lg font-semibold text-white
                     shadow-lg shadow-green-200
                     transition-all hover:shadow-xl hover:brightness-110
                     disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Setting up..." : "Start My Green Journey 🌱"}
        </button>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-gray-400">
          HackFax × PatriotHacks 2026 · George Mason University
        </p>
      </div>
    </div>
  );
}
