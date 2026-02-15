"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, MessageCircle, Trophy, Heart, Volume2, Sparkles, Users, Recycle, ChevronRight } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { getGlobalStats, getDailyTipText, type GlobalStats } from "@/lib/api";

const features = [
  {
    href: "/snap",
    icon: Camera,
    title: "Snap & Sort",
    desc: "Take a photo of any waste — AI tells you how to sort it",
    color: "from-[#2E7D32] to-[#43A047]",
    bg: "bg-[#E8F5E9]",
    iconColor: "text-[#2E7D32]",
  },
  {
    href: "/chat",
    icon: MessageCircle,
    title: "EcoChat",
    desc: "Ask sustainability questions — with PatriotAI routing",
    color: "from-[#1565C0] to-[#42A5F5]",
    bg: "bg-[#E3F2FD]",
    iconColor: "text-[#1565C0]",
  },
  {
    href: "/dashboard",
    icon: Trophy,
    title: "Green Score",
    desc: "Track your impact, climb the leaderboard, earn badges",
    color: "from-[#F57F17] to-[#FFB300]",
    bg: "bg-[#FFF8E1]",
    iconColor: "text-[#F57F17]",
  },
  {
    href: "/quiz",
    icon: Heart,
    title: "EcoMatch Quiz",
    desc: "Swipe to discover your sustainability personality",
    color: "from-[#C2185B] to-[#E91E63]",
    bg: "bg-[#FCE4EC]",
    iconColor: "text-[#C2185B]",
  },
];

export default function HomePage() {
  const { displayName, user } = useUser();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [dailyTip, setDailyTip] = useState<string>("");

  useEffect(() => {
    getGlobalStats().then(setStats).catch(() => {});
    getDailyTipText()
      .then((data) => setDailyTip(data.tip))
      .catch(() => setDailyTip("Carry a reusable water bottle today — small actions make a big difference! 💚"));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* ── Hero Section ── */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F5E9] via-white to-[#FCE4EC] p-8 shadow-sm md:p-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-[#2E7D32] md:text-5xl">
              Green<span className="text-[#E91E63]">Mason</span>
            </h1>
            <p className="mb-1 text-lg text-gray-600 md:text-xl">
              AI-Powered Campus Sustainability Hub
            </p>
            <p className="mb-6 text-sm font-medium italic text-[#E91E63]">
              This Valentine&apos;s Day, Fall in Love with a Greener Campus 💚
            </p>
            {displayName ? (
              <p className="text-lg text-gray-700">
                Welcome back,{" "}
                <span className="font-semibold text-[#2E7D32]">
                  {displayName}
                </span>
                !{" "}
                {user?.total_score ? (
                  <span className="text-[#E91E63]">
                    You have{" "}
                    <span className="font-bold">{user.total_score}</span> Love
                    Points 💕
                  </span>
                ) : (
                  <span className="text-gray-500">
                    Start earning Love Points!
                  </span>
                )}
              </p>
            ) : (
              <p className="text-gray-500">
                Join the green movement at GMU 🌿
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <Image
              src="/sprout/sprout-wave.png"
              alt="Sprout mascot"
              width={180}
              height={180}
              className="drop-shadow-xl"
              priority
            />
          </div>
        </div>

        {/* Decorative hearts */}
        <div className="absolute -top-2 right-8 text-3xl text-[#E91E63]/15">♥</div>
        <div className="absolute bottom-4 left-6 text-2xl text-[#E91E63]/10">♥</div>
        <div className="absolute top-12 right-24 text-lg text-[#2E7D32]/10">🌿</div>
      </section>

      {/* ── Stats Bar ── */}
      {stats && (
        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: Users, label: "Green Patriots", value: stats.total_users, color: "text-[#2E7D32]" },
            { icon: Recycle, label: "Items Sorted", value: stats.total_actions, color: "text-[#1565C0]" },
            { icon: Heart, label: "Love Pledges", value: stats.total_pledges, color: "text-[#E91E63]" },
            { icon: Sparkles, label: "Total Points", value: stats.total_points, color: "text-[#F57F17]" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
            >
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Feature Cards ── */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          What would you like to do? 🌿
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${f.bg}`}>
                <f.icon className={`h-7 w-7 ${f.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 group-hover:text-[#2E7D32]">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-[#2E7D32]" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Daily Tip ── */}
      {dailyTip && (
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-[#E8F5E9] to-[#FCE4EC] p-6">
          <div className="flex items-start gap-4">
            <Image
              src="/sprout/sprout-headphones.png"
              alt="Sprout with headphones"
              width={64}
              height={64}
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold text-[#2E7D32]">
                  Today&apos;s Eco-Tip 🌱
                </h3>
                <span className="rounded-full bg-[#E91E63]/10 px-2 py-0.5 text-xs font-medium text-[#E91E63]">
                  Valentine&apos;s Special
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-700">{dailyTip}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Powered By ── */}
      <section className="mb-4 rounded-2xl bg-white p-6 shadow-sm">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-gray-400">
          Powered By
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="text-lg">✨</span> Google Gemini AI
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-lg">🎓</span> PatriotAI
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-lg">🔊</span> ElevenLabs
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-lg">🍃</span> MongoDB Atlas
          </span>
        </div>
        <p className="mt-3 text-center text-xs text-gray-400">
          HackFax × PatriotHacks 2026 · George Mason University
        </p>
      </section>
    </div>
  );
}
