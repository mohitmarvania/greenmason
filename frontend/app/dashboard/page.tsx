"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trophy, Heart, Flame, Star, Send, Crown, Medal, Award, Loader2, Volume2 } from "lucide-react";
import { useUser } from "@/lib/user-context";
import {
  getLeaderboard,
  getPledges,
  createPledge,
  logScore,
  getScoreSummaryAudioUrl,
  type LeaderboardEntry,
  type Pledge,
} from "@/lib/api";

type Tab = "stats" | "leaderboard" | "pledges";

const rankBadges: Record<number, { icon: typeof Crown; color: string; bg: string; label: string }> = {
  1: { icon: Crown, color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200", label: "🥇" },
  2: { icon: Medal, color: "text-gray-400", bg: "bg-gray-50 border-gray-200", label: "🥈" },
  3: { icon: Award, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", label: "🥉" },
};

// Sprout growth stages based on score
function getSproutStage(score: number) {
  if (score >= 500) return { label: "Eco Legend 🌳", image: "/sprout/sprout-celebrate.png", level: 5 };
  if (score >= 200) return { label: "Green Champion 🌿", image: "/sprout/sprout-celebrate.png", level: 4 };
  if (score >= 100) return { label: "Sustainability Star ⭐", image: "/sprout/sprout-wave.png", level: 3 };
  if (score >= 50) return { label: "Eco Explorer 🌱", image: "/sprout/sprout-search.png", level: 2 };
  return { label: "Fresh Sprout 🫛", image: "/sprout/sprout-wave.png", level: 1 };
}

// Achievement badges
function getAchievements(score: number, actions: number) {
  const badges = [];
  if (actions >= 1) badges.push({ emoji: "🌱", name: "First Date with Recycling" });
  if (actions >= 5) badges.push({ emoji: "💕", name: "Compost Cupid" });
  if (actions >= 10) badges.push({ emoji: "♻️", name: "Recycling Romantic" });
  if (score >= 50) badges.push({ emoji: "🌿", name: "Green Heart" });
  if (score >= 100) badges.push({ emoji: "💚", name: "Earth Lover" });
  if (score >= 200) badges.push({ emoji: "🌍", name: "Planet Protector" });
  if (score >= 500) badges.push({ emoji: "💎", name: "Sustainability Soulmate" });
  return badges;
}

export default function DashboardPage() {
  const { username, user, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("stats");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [pledgeInput, setPledgeInput] = useState("");
  const [isSubmittingPledge, setIsSubmittingPledge] = useState(false);
  const [isLoadingLB, setIsLoadingLB] = useState(false);
  const [isLoadingPledges, setIsLoadingPledges] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      setIsLoadingLB(true);
      getLeaderboard(20).then((data) => setLeaderboard(data.leaderboard)).catch(() => {}).finally(() => setIsLoadingLB(false));
    }
    if (activeTab === "pledges") {
      setIsLoadingPledges(true);
      getPledges(50).then((data) => setPledges(data.pledges)).catch(() => {}).finally(() => setIsLoadingPledges(false));
    }
  }, [activeTab]);

  const handleSubmitPledge = async () => {
    if (!pledgeInput.trim() || !username) return;
    setIsSubmittingPledge(true);
    try {
      await createPledge(username, pledgeInput.trim());
      await logScore(username, "pledge", 20, `Pledge: ${pledgeInput.trim().slice(0, 50)}`);
      setPledgeInput("");
      await refreshUser();
      // Refresh pledges
      const data = await getPledges(50);
      setPledges(data.pledges);
    } catch {}
    setIsSubmittingPledge(false);
  };

  const handlePlayScore = async () => {
    if (!username) return;
    setIsPlayingAudio(true);

    const scoreText = `Hey ${user?.display_name || username}! Your Green Score is ${user?.total_score || 0} points, and you're ranked number ${user?.rank || 1} on the campus leaderboard. Keep making sustainable choices — every action counts! Happy Valentine's Day from GreenMason.`;

    // Try ElevenLabs first, fall back to browser speech
    try {
      const audio = new Audio(getScoreSummaryAudioUrl(username));
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        // Fallback: browser built-in speech
        const utterance = new SpeechSynthesisUtterance(scoreText);
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      };
      await audio.play();
    } catch {
      // Fallback: browser built-in speech
      const utterance = new SpeechSynthesisUtterance(scoreText);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stage = getSproutStage(user?.total_score || 0);
  const achievements = getAchievements(user?.total_score || 0, user?.actions_count || 0);
  const nextLevelScore = [50, 100, 200, 500, 1000][stage.level - 1] || 1000;
  const progress = Math.min(((user?.total_score || 0) / nextLevelScore) * 100, 100);

  const tabs: { key: Tab; label: string; icon: typeof Trophy }[] = [
    { key: "stats", label: "My Stats", icon: Star },
    { key: "leaderboard", label: "Leaderboard", icon: Trophy },
    { key: "pledges", label: "Love Pledges", icon: Heart },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Image src="/sprout/sprout-celebrate.png" alt="Sprout" width={44} height={44} />
        <div>
          <h1 className="text-lg font-bold text-[#2E7D32]">Green Score Dashboard</h1>
          <p className="text-xs text-gray-500">Track your impact, climb the ranks</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-[#F5F5F5] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-[#2E7D32] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* ═══ MY STATS TAB ═══ */}
      {activeTab === "stats" && (
        <div className="space-y-4 animate-slide-up">
          {/* Score Card */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8F5E9] via-white to-[#FCE4EC] p-6 shadow-sm">
            <div className="flex items-center gap-5">
              <Image src={stage.image} alt="Sprout level" width={80} height={80} className="flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{stage.label}</p>
                <p className="text-4xl font-bold text-[#2E7D32]">
                  {user?.total_score || 0}
                  <span className="ml-1 text-lg text-[#E91E63]">💕</span>
                </p>
                <p className="text-xs text-gray-500">Love Points earned</p>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10px] text-gray-400">
                    <span>Level {stage.level}</span>
                    <span>{user?.total_score || 0} / {nextLevelScore}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2E7D32] to-[#E91E63] transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/70 p-3 text-center">
                <p className="text-xl font-bold text-[#2E7D32]">{user?.actions_count || 0}</p>
                <p className="text-xs text-gray-500">Actions taken</p>
              </div>
              <div className="rounded-xl bg-white/70 p-3 text-center">
                <p className="text-xl font-bold text-[#E91E63]">{user?.rank || "—"}</p>
                <p className="text-xs text-gray-500">Campus rank</p>
              </div>
            </div>

            {/* Hear my score */}
            <button
              onClick={handlePlayScore}
              disabled={isPlayingAudio}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#2E7D32] bg-white px-4 py-2.5 text-sm font-medium text-[#2E7D32] transition-all hover:bg-[#E8F5E9] disabled:opacity-50"
            >
              <Volume2 className={`h-4 w-4 ${isPlayingAudio ? "animate-pulse" : ""}`} />
              {isPlayingAudio ? "Playing..." : "Hear My Score Summary 🔊"}
            </button>
          </div>

          {/* Achievements */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
              <Flame className="h-5 w-5 text-[#E91E63]" />
              Achievements
            </h3>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {achievements.map((badge) => (
                  <div key={badge.name} className="flex items-center gap-2 rounded-xl bg-[#FCE4EC]/50 p-3">
                    <span className="text-xl">{badge.emoji}</span>
                    <span className="text-xs font-medium text-gray-700">{badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400">
                Start sorting waste and chatting to earn badges! 🌱
              </p>
            )}
          </div>

          {/* How to earn points */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-gray-800">How to Earn Love Points 💕</h3>
            <div className="space-y-2">
              {[
                { action: "Sort waste correctly", points: "+10–20", emoji: "📸" },
                { action: "Chat about sustainability", points: "+5", emoji: "💬" },
                { action: "Write a Love Pledge", points: "+20", emoji: "💌" },
                { action: "Complete EcoMatch Quiz", points: "+25", emoji: "💕" },
              ].map((item) => (
                <div key={item.action} className="flex items-center justify-between rounded-lg bg-[#F5F5F5] px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-gray-700">
                    <span>{item.emoji}</span> {item.action}
                  </span>
                  <span className="text-sm font-bold text-[#2E7D32]">{item.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ LEADERBOARD TAB ═══ */}
      {activeTab === "leaderboard" && (
        <div className="animate-slide-up">
          <div className="rounded-2xl bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#2E7D32]">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Most Loved by Earth 🌍
              </h3>
              <p className="text-xs text-gray-500">Campus-wide sustainability leaderboard</p>
            </div>

            {isLoadingLB ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#2E7D32]" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No entries yet — be the first! 🌱
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {leaderboard.map((entry) => {
                  const badge = rankBadges[entry.rank];
                  const isMe = entry.username === username;
                  return (
                    <div
                      key={entry.username}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isMe ? "bg-[#FCE4EC]/30" : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                        {badge ? (
                          <span className="text-xl">{badge.label}</span>
                        ) : (
                          <span className="text-sm font-bold text-gray-400">
                            {entry.rank}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className={`truncate text-sm font-medium ${isMe ? "text-[#E91E63]" : "text-gray-800"}`}>
                          {entry.display_name}
                          {isMe && <span className="ml-1 text-xs">(you)</span>}
                        </p>
                        <p className="text-xs text-gray-400">
                          {entry.actions_count} action{entry.actions_count !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="flex items-center gap-1 rounded-full bg-[#E8F5E9] px-3 py-1">
                        <Heart className="h-3 w-3 fill-[#E91E63] text-[#E91E63]" />
                        <span className="text-sm font-bold text-[#2E7D32]">
                          {entry.total_score}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ LOVE PLEDGES TAB ═══ */}
      {activeTab === "pledges" && (
        <div className="space-y-4 animate-slide-up">
          {/* Write pledge */}
          <div className="rounded-2xl bg-gradient-to-r from-[#FCE4EC] to-[#F3E5F5] p-5">
            <h3 className="mb-1 text-lg font-bold text-[#E91E63]">
              💌 Write a Love Letter to the Planet
            </h3>
            <p className="mb-3 text-xs text-gray-600">
              Make a sustainability pledge — earn 20 Love Points!
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={pledgeInput}
                onChange={(e) => setPledgeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitPledge()}
                placeholder="I pledge to..."
                maxLength={200}
                className="flex-1 rounded-xl border-2 border-white/50 bg-white/80 px-4 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-[#E91E63] focus:ring-2 focus:ring-[#E91E63]/20"
              />
              <button
                onClick={handleSubmitPledge}
                disabled={!pledgeInput.trim() || isSubmittingPledge}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#E91E63] text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
              >
                {isSubmittingPledge ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Pledges wall */}
          {isLoadingPledges ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#E91E63]" />
            </div>
          ) : pledges.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <Image src="/sprout/sprout-wave.png" alt="Sprout" width={60} height={60} className="mx-auto mb-2 opacity-60" />
              <p className="text-sm text-gray-400">No pledges yet — be the first to show love! 💕</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {pledges.map((pledge, i) => (
                <div
                  key={`${pledge.username}-${i}`}
                  className="group relative overflow-hidden rounded-2xl border border-[#FCE4EC] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Decorative heart */}
                  <div className="absolute -right-2 -top-2 text-4xl text-[#E91E63]/5 transition-all group-hover:text-[#E91E63]/10">
                    ♥
                  </div>

                  <p className="mb-3 text-sm leading-relaxed text-gray-700">
                    &ldquo;{pledge.pledge_text}&rdquo;
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F5E9] text-xs font-bold text-[#2E7D32]">
                        {(pledge.display_name || pledge.username)[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {pledge.display_name || pledge.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#E91E63]">
                      <Heart className="h-3.5 w-3.5 fill-[#E91E63]" />
                      <span className="text-xs font-medium">{pledge.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
