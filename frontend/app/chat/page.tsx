"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, Loader2, ExternalLink, Sparkles, Bot } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { sendChatMessage, logScore, type ChatMessage, type ChatResponse } from "@/lib/api";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  patriotai?: {
    agent: string;
    reason: string;
    url: string;
  } | null;
}

const suggestions = [
  "How can I recycle on campus?",
  "Sustainable food options at GMU?",
  "Tips to reduce my carbon footprint",
  "Where is the food pantry?",
  "Green commuting tips for students",
  "What can I compost?",
];

const agentUrls: Record<string, string> = {
  PatriotPal: "https://patriotai.gmu.edu/chat/agents",
  NourishNet: "https://patriotai.gmu.edu/chat/agents",
  CourseMate: "https://patriotai.gmu.edu/chat/agents",
  DocuMate: "https://patriotai.gmu.edu/chat/agents",
};

const agentEmojis: Record<string, string> = {
  PatriotPal: "🎓",
  NourishNet: "🍎",
  CourseMate: "📚",
  DocuMate: "📄",
};

export default function ChatPage() {
  const { username, refreshUser } = useUser();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: DisplayMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build history for context
      const history: ChatMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response: ChatResponse = await sendChatMessage(text.trim(), history);

      const assistantMsg: DisplayMessage = {
        role: "assistant",
        content: response.reply,
        patriotai: response.route_to_patriotai
          ? {
              agent: response.patriotai_agent || "PatriotPal",
              reason: response.patriotai_reason || "",
              url: agentUrls[response.patriotai_agent || "PatriotPal"] || "https://patriotai.gmu.edu",
            }
          : null,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Log score for chatting (non-critical)
      if (username) {
        try {
          await logScore(username, "chat", 5, "EcoChat conversation");
          await refreshUser();
        } catch {}
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble responding. Please try again!",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col px-4 py-4 md:h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <Image src="/sprout/sprout-wave.png" alt="Sprout" width={40} height={40} />
        <div>
          <h1 className="text-lg font-bold text-[#2E7D32]">EcoChat</h1>
          <p className="text-xs text-gray-500">Powered by Gemini AI + PatriotAI</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-white p-4 shadow-sm">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Image src="/sprout/sprout-think.png" alt="Sprout thinking" width={100} height={100} className="opacity-80" />
            <div>
              <h2 className="mb-1 text-lg font-semibold text-[#2E7D32]">
                Hey there, eco-Patriot! 🌿
              </h2>
              <p className="mb-4 text-sm text-gray-500">
                Ask me anything about sustainability, recycling, or campus green initiatives.
                <br />
                I&apos;ll route you to PatriotAI when needed!
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-[#C8E6C9] bg-[#E8F5E9]/50 px-3 py-1.5 text-xs font-medium text-[#2E7D32] transition-all hover:bg-[#E8F5E9] hover:shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : "order-1"}`}>
              {/* Avatar */}
              {msg.role === "assistant" && (
                <div className="mb-1 flex items-center gap-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F5E9]">
                    <Bot className="h-3.5 w-3.5 text-[#2E7D32]" />
                  </div>
                  <span className="text-xs font-medium text-[#2E7D32]">GreenMason</span>
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white"
                    : "bg-[#F5F5F5] text-gray-800"
                }`}
              >
                {msg.content}
              </div>

              {/* PatriotAI routing card */}
              {msg.patriotai && (
                <div className="mt-2 overflow-hidden rounded-xl border border-[#7C4DFF]/20 bg-gradient-to-r from-[#EDE7F6] to-[#E8EAF6]">
                  <div className="p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-lg">{agentEmojis[msg.patriotai.agent] || "🎓"}</span>
                      <span className="text-sm font-bold text-[#5E35B1]">
                        {msg.patriotai.agent} can help!
                      </span>
                    </div>
                    <p className="mb-2 text-xs text-gray-600">{msg.patriotai.reason}</p>
                    <a
                      href={msg.patriotai.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#5E35B1] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#4527A0]"
                    >
                      Open PatriotAI
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="bg-[#5E35B1]/5 px-3 py-1.5">
                    <p className="text-[10px] text-[#5E35B1]/70">
                      Powered by Cloudforce nebulaONE® on Microsoft Azure
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="mb-4 flex justify-start">
            <div className="max-w-[85%]">
              <div className="mb-1 flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F5E9]">
                  <Bot className="h-3.5 w-3.5 text-[#2E7D32]" />
                </div>
                <span className="text-xs font-medium text-[#2E7D32]">GreenMason</span>
              </div>
              <div className="rounded-2xl bg-[#F5F5F5] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#2E7D32]" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#2E7D32]" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#2E7D32]" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-gray-400">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips (shown when there are messages) */}
      {messages.length > 0 && messages.length < 6 && !isLoading && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {suggestions.slice(0, 3).map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="flex-shrink-0 rounded-full border border-[#C8E6C9] bg-white px-3 py-1 text-xs text-[#2E7D32] transition-all hover:bg-[#E8F5E9]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about sustainability..."
            disabled={isLoading}
            className="w-full rounded-xl border-2 border-[#E8F5E9] bg-white px-4 py-3 pr-12 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 disabled:opacity-50"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Sparkles className="h-4 w-4 text-[#C8E6C9]" />
          </div>
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#43A047] text-white shadow-lg shadow-green-200 transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
}
