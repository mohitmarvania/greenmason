"use client";

import { useState } from "react";
import Image from "next/image";
import { ThumbsUp, ThumbsDown, Share2, RotateCcw, Heart, Leaf } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { logScore } from "@/lib/api";

interface Question {
  id: number;
  text: string;
  category: string;
}

const questions: Question[] = [
  { id: 1, text: "I always carry a reusable water bottle", category: "waste" },
  { id: 2, text: "I sort my recycling carefully before tossing it", category: "waste" },
  { id: 3, text: "I prefer biking or walking over driving to campus", category: "transport" },
  { id: 4, text: "I bring my own bags when grocery shopping", category: "waste" },
  { id: 5, text: "I try to eat less meat for environmental reasons", category: "food" },
  { id: 6, text: "I turn off lights and unplug devices when not in use", category: "energy" },
  { id: 7, text: "I buy second-hand clothes or thrift regularly", category: "consumption" },
  { id: 8, text: "I would compost food scraps if given the option", category: "food" },
  { id: 9, text: "I take shorter showers to save water", category: "energy" },
  { id: 10, text: "I encourage friends to adopt sustainable habits", category: "social" },
];

interface Personality {
  title: string;
  emoji: string;
  description: string;
  tip: string;
  color: string;
  bg: string;
}

function getPersonality(yesCount: number): Personality {
  if (yesCount >= 9) {
    return {
      title: "Sustainability Soulmate",
      emoji: "💚",
      description: "You and the Earth are in a deeply committed relationship. Your eco-habits are inspiring — you're a true green champion!",
      tip: "Keep leading by example. Consider joining GMU's Office of Sustainability as a volunteer!",
      color: "text-[#2E7D32]",
      bg: "from-[#E8F5E9] to-[#C8E6C9]",
    };
  }
  if (yesCount >= 7) {
    return {
      title: "Recycling Romantic",
      emoji: "♻️",
      description: "You've got a strong green heart! You make sustainable choices most of the time and care deeply about the planet.",
      tip: "Try composting your food scraps — check if your dining hall has a composting bin!",
      color: "text-[#1B5E20]",
      bg: "from-[#E8F5E9] to-[#DCEDC8]",
    };
  }
  if (yesCount >= 5) {
    return {
      title: "Compost Cupid",
      emoji: "💕",
      description: "You're falling in love with sustainability! You've got great habits and room to grow even greener.",
      tip: "Start carrying a reusable bag and water bottle — small changes that make a big difference!",
      color: "text-[#E91E63]",
      bg: "from-[#FCE4EC] to-[#F8BBD0]",
    };
  }
  if (yesCount >= 3) {
    return {
      title: "Solar Sweetheart",
      emoji: "☀️",
      description: "You've started your sustainability journey — like the first rays of sunshine on a new day. Keep growing!",
      tip: "Try one new green habit this week: turn off lights, skip the plastic straw, or take the Mason Shuttle!",
      color: "text-[#F57F17]",
      bg: "from-[#FFF8E1] to-[#FFF9C4]",
    };
  }
  return {
    title: "Fresh Sprout",
    emoji: "🌱",
    description: "Every great journey starts with a single step — or in your case, a single sprout! The planet is excited to get to know you better.",
    tip: "Start with the easiest win: find your nearest recycling bin on campus and use it today!",
    color: "text-[#43A047]",
    bg: "from-[#E8F5E9] to-[#F1F8E9]",
  };
}

export default function QuizPage() {
  const { username, refreshUser } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [yesCount, setYesCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);
  const [scored, setScored] = useState(false);

  const handleSwipe = async (answer: "yes" | "no") => {
    setSwipeDir(answer === "yes" ? "right" : "left");

    if (answer === "yes") setYesCount((prev) => prev + 1);

    // Wait for animation
    setTimeout(() => {
      setSwipeDir(null);
      if (currentIndex + 1 >= questions.length) {
        setIsComplete(true);
        // Log score
        if (username && !scored) {
          setScored(true);
          logScore(username, "quiz", 25, "Completed EcoMatch Quiz").then(() => refreshUser()).catch(() => {});
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 300);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setYesCount(0);
    setIsComplete(false);
    setSwipeDir(null);
    setScored(false);
  };

  const handleShare = () => {
    const personality = getPersonality(yesCount);
    const text = `I just took the GreenMason EcoMatch Quiz and I'm a "${personality.title}" ${personality.emoji}! Find out your sustainability personality at GreenMason 🌿💚 #HackFax #PatriotHacks #Sustainability`;
    if (navigator.share) {
      navigator.share({ title: "My EcoMatch Result", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
      alert("Result copied to clipboard!");
    }
  };

  const personality = getPersonality(yesCount);
  const progress = ((currentIndex + (isComplete ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[#E91E63]">
          EcoMatch Quiz 💕
        </h1>
        <p className="text-sm text-gray-500">
          Swipe to discover your sustainability personality!
        </p>
      </div>

      {/* ── Quiz In Progress ── */}
      {!isComplete && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div>
            <div className="mb-1 flex justify-between text-xs text-gray-400">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#E91E63] to-[#2E7D32] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Swipe Card */}
          <div className="relative flex justify-center" style={{ minHeight: 280 }}>
            {/* Next card (peeking behind) */}
            {currentIndex + 1 < questions.length && (
              <div className="absolute top-3 w-full max-w-sm scale-95 rounded-3xl bg-white p-8 opacity-50 shadow-sm" />
            )}

            {/* Current card */}
            <div
              className={`relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg transition-all duration-300 ${
                swipeDir === "right"
                  ? "translate-x-32 rotate-12 opacity-0"
                  : swipeDir === "left"
                  ? "-translate-x-32 -rotate-12 opacity-0"
                  : ""
              }`}
            >
              {/* Category pill */}
              <div className="mb-4 flex justify-center">
                <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-medium text-[#2E7D32]">
                  {questions[currentIndex].category}
                </span>
              </div>

              {/* Question */}
              <p className="mb-8 text-center text-xl font-semibold leading-relaxed text-gray-800">
                {questions[currentIndex].text}
              </p>

              {/* Swipe hint */}
              <div className="flex items-center justify-between px-4 text-xs text-gray-300">
                <span>← Nope</span>
                <span>Yes! →</span>
              </div>

              {/* Overlay indicators */}
              {swipeDir === "right" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-[#2E7D32]/10">
                  <span className="rotate-[-12deg] rounded-xl border-4 border-[#2E7D32] px-6 py-2 text-3xl font-bold text-[#2E7D32]">
                    YES! 💚
                  </span>
                </div>
              )}
              {swipeDir === "left" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-[#E91E63]/10">
                  <span className="rotate-12 rounded-xl border-4 border-[#E91E63] px-6 py-2 text-3xl font-bold text-[#E91E63]">
                    NOPE 💔
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => handleSwipe("no")}
              disabled={swipeDir !== null}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#E91E63] bg-white text-[#E91E63] shadow-lg transition-all hover:scale-110 hover:bg-[#FCE4EC] active:scale-95 disabled:opacity-50"
            >
              <ThumbsDown className="h-7 w-7" />
            </button>

            <div className="text-center">
              <Leaf className="mx-auto h-6 w-6 text-gray-300" />
            </div>

            <button
              onClick={() => handleSwipe("yes")}
              disabled={swipeDir !== null}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#2E7D32] bg-white text-[#2E7D32] shadow-lg transition-all hover:scale-110 hover:bg-[#E8F5E9] active:scale-95 disabled:opacity-50"
            >
              <ThumbsUp className="h-7 w-7" />
            </button>
          </div>
        </div>
      )}

      {/* ── Result Screen ── */}
      {isComplete && (
        <div className="animate-slide-up space-y-5">
          {/* Points earned */}
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#FCE4EC] to-[#E8F5E9] p-4">
            <Image src="/sprout/sprout-celebrate.png" alt="Sprout celebrating" width={50} height={50} />
            <p className="text-lg font-bold text-[#E91E63]">
              +25 <Heart className="inline h-4 w-4 fill-[#E91E63]" /> Love Points!
            </p>
          </div>

          {/* Personality Card */}
          <div className={`overflow-hidden rounded-3xl bg-gradient-to-br ${personality.bg} p-8 text-center shadow-lg`}>
            <p className="mb-2 text-6xl">{personality.emoji}</p>
            <p className="mb-1 text-sm font-medium text-gray-500">You are a...</p>
            <h2 className={`mb-4 text-3xl font-bold ${personality.color}`}>
              {personality.title}
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-700">
              {personality.description}
            </p>

            {/* Score breakdown */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2">
              <span className="text-sm font-medium text-gray-600">
                {yesCount}/{questions.length} green habits
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: questions.length }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i < yesCount ? "bg-[#2E7D32]" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="rounded-xl bg-white/60 p-4">
              <p className="text-xs font-semibold text-gray-500">💡 Personalized Tip</p>
              <p className="mt-1 text-sm text-gray-700">{personality.tip}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E91E63] to-[#C2185B] px-4 py-3 font-semibold text-white shadow-lg transition-all hover:brightness-110"
            >
              <Share2 className="h-4 w-4" />
              Share Result
            </button>
            <button
              onClick={handleReset}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#2E7D32] bg-white px-4 py-3 font-semibold text-[#2E7D32] transition-all hover:bg-[#E8F5E9]"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
