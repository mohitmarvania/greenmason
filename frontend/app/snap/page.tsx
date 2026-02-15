"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, Upload, X, RotateCcw, Loader2, Sparkles, MapPin, Lightbulb, Heart } from "lucide-react";
import { useUser } from "@/lib/user-context";
import { classifyWasteFile, logScore, type ClassificationResult } from "@/lib/api";
import { compressImage, blobToFile } from "@/lib/image-utils";

const categoryConfig: Record<string, { emoji: string; label: string; gradient: string; bg: string }> = {
  recyclable:  { emoji: "♻️",  label: "Recyclable",  gradient: "from-[#2E7D32] to-[#43A047]", bg: "bg-[#E8F5E9]" },
  compostable: { emoji: "🌱",  label: "Compostable", gradient: "from-[#5D4037] to-[#795548]", bg: "bg-[#EFEBE9]" },
  landfill:    { emoji: "🗑️",  label: "Landfill",    gradient: "from-[#616161] to-[#757575]", bg: "bg-[#F5F5F5]" },
  "e-waste":   { emoji: "🔋",  label: "E-Waste",     gradient: "from-[#F57F17] to-[#FFB300]", bg: "bg-[#FFF8E1]" },
  hazardous:   { emoji: "⚠️",  label: "Hazardous",   gradient: "from-[#C62828] to-[#E53935]", bg: "bg-[#FFEBEE]" },
  reusable:    { emoji: "💚",  label: "Reusable",    gradient: "from-[#1565C0] to-[#42A5F5]", bg: "bg-[#E3F2FD]" },
};

// Standalone image preview component that uses direct DOM manipulation
// This bypasses React's virtual DOM for the <img> src, fixing Chrome rendering issues
function ImagePreview({ file }: { file: File | null }) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!file || !imgRef.current) return;
    const url = URL.createObjectURL(file);
    imgRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file) return null;

  return (
    <img
      ref={imgRef}
      alt="Captured waste item"
      className="h-full w-full object-contain bg-gray-50"
    />
  );
}

export default function SnapPage() {
  const { username, refreshUser } = useUser();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setOriginalFile(file);
    setIsProcessing(true);

    try {
      const { blob } = await compressImage(file, 1024, 0.85);
      setProcessedFile(blobToFile(blob, "photo.jpg"));
    } catch {
      setProcessedFile(file);
    }
    setIsProcessing(false);
  };

  const handleAnalyze = async () => {
    if (!processedFile || !username) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const classification = await classifyWasteFile(processedFile);
      setResult(classification);

      try {
        await logScore(username, "sort", classification.points_earned, `Sorted: ${classification.item_name} (${classification.category})`);
        await refreshUser();
      } catch {}

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Classification failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setOriginalFile(null);
    setProcessedFile(null);
    setResult(null);
    setError(null);
    setShowConfetti(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const hasImage = originalFile !== null;
  const cat = result ? categoryConfig[result.category] || categoryConfig.landfill : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-3 flex justify-center">
          <Image src="/sprout/sprout-search.png" alt="Sprout searching" width={80} height={80} />
        </div>
        <h1 className="text-2xl font-bold text-[#2E7D32]">Snap & Sort</h1>
        <p className="text-sm text-gray-500">Take a photo or upload an image — AI will tell you how to sort it</p>
      </div>

      {/* ── Upload Area ── */}
      {!hasImage && !isProcessing && (
        <div className="mb-6 rounded-3xl border-2 border-dashed border-[#C8E6C9] bg-[#E8F5E9]/30 p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F5E9]">
              <Camera className="h-10 w-10 text-[#2E7D32]" />
            </div>
            <p className="text-center text-gray-600">Snap a photo of any waste item</p>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#43A047] px-6 py-3 font-semibold text-white shadow-lg shadow-green-200 transition-all hover:shadow-xl hover:brightness-110"
              >
                <Camera className="h-5 w-5" />
                Take Photo
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#2E7D32] bg-white px-6 py-3 font-semibold text-[#2E7D32] transition-all hover:bg-[#E8F5E9]"
              >
                <Upload className="h-5 w-5" />
                Upload Image
              </button>
            </div>

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelected} />
            <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif" className="hidden" onChange={handleFileSelected} />
          </div>
        </div>
      )}

      {/* ── Processing Image ── */}
      {isProcessing && (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl bg-[#E8F5E9]/50 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#2E7D32]" />
          <p className="text-sm font-medium text-[#2E7D32]">Preparing your image...</p>
        </div>
      )}

      {/* ── Image Preview ── */}
      {hasImage && !result && !isProcessing && (
        <div className="mb-6 animate-slide-up">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-md">
            <div className="relative aspect-square w-full sm:aspect-video">
              <ImagePreview file={originalFile} />
            </div>
            <button
              onClick={handleReset}
              className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#43A047] px-6 py-3.5 text-lg font-semibold text-white shadow-lg shadow-green-200 transition-all hover:shadow-xl hover:brightness-110 disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing with Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Classify This Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading State ── */}
      {isAnalyzing && (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl bg-[#E8F5E9]/50 p-8">
          <Image src="/sprout/sprout-think.png" alt="Sprout thinking" width={80} height={80} className="animate-pulse" />
          <p className="text-sm font-medium text-[#2E7D32]">Sprout is analyzing your item...</p>
          <div className="flex gap-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#2E7D32]" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#2E7D32]" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-[#2E7D32]" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={handleReset} className="mt-2 text-sm font-medium text-red-600 underline">
            Try again
          </button>
        </div>
      )}

      {/* ── Classification Result ── */}
      {result && cat && (
        <div className="animate-slide-up space-y-4">
          {/* Confetti */}
          {showConfetti && (
            <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-confetti absolute text-2xl"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${Math.random() * 20}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${1.5 + Math.random() * 1}s`,
                  }}
                >
                  {["💚", "♻️", "🌿", "🌍", "💕", "✨"][i % 6]}
                </div>
              ))}
            </div>
          )}

          {/* Points earned card */}
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#FCE4EC] to-[#E8F5E9] p-4">
            <Image src="/sprout/sprout-celebrate.png" alt="Sprout celebrating" width={56} height={56} />
            <div className="text-center">
              <p className="text-2xl font-bold text-[#E91E63]">
                +{result.points_earned} <Heart className="inline h-5 w-5 fill-[#E91E63]" /> Love Points!
              </p>
              <p className="text-sm text-gray-600">Great job sorting responsibly!</p>
            </div>
          </div>

          {/* Image + Category badge */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-md">
            <div className="relative aspect-video w-full">
              <ImagePreview file={originalFile} />
              <div className={`absolute bottom-3 left-3 rounded-full bg-gradient-to-r ${cat.gradient} px-4 py-1.5 text-sm font-bold text-white shadow-lg`}>
                {cat.emoji} {cat.label}
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{result.item_name}</h2>
                <span className={`mt-1 inline-block rounded-full ${cat.bg} px-3 py-0.5 text-xs font-medium`}>
                  {result.confidence} confidence
                </span>
              </div>

              <div className={`rounded-xl ${cat.bg} p-4`}>
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Sparkles className="h-4 w-4" /> How to dispose
                </div>
                <p className="text-sm leading-relaxed text-gray-700">{result.disposal_instructions}</p>
              </div>

              <div className="rounded-xl bg-[#E8F5E9] p-4">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#2E7D32]">
                  <MapPin className="h-4 w-4" /> GMU Campus Tip
                </div>
                <p className="text-sm leading-relaxed text-gray-700">{result.gmu_tip}</p>
              </div>

              <div className="rounded-xl bg-[#FCE4EC] p-4">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#E91E63]">
                  <Lightbulb className="h-4 w-4" /> Did you know?
                </div>
                <p className="text-sm leading-relaxed text-gray-700">{result.fun_fact}</p>
              </div>
            </div>
          </div>

          {/* Sort again button */}
          <button
            onClick={handleReset}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#2E7D32] bg-white px-6 py-3 font-semibold text-[#2E7D32] transition-all hover:bg-[#E8F5E9]"
          >
            <RotateCcw className="h-5 w-5" />
            Sort Another Item
          </button>
        </div>
      )}
    </div>
  );
}
