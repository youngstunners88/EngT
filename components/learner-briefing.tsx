"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Brain, Target, ArrowLeft, Play, Lightbulb, RefreshCw, CloudOff } from "lucide-react"
import { LayerBadge } from "./layer-badge"
import type { CoachBriefing, Difficulty, LearnerSummary } from "@/types/learner"

interface LearnerBriefingProps {
  difficulty: Difficulty
  summary: LearnerSummary
  cachedBriefing: CoachBriefing | null
  onBack: () => void
  onStart: () => void
  onBriefingReady: (briefing: CoachBriefing) => void
}

/**
 * Pre-game screen. This is the moment the system shows the learner that it has
 * actually learned about THEM. It is the Layer 3 surface — what the data
 * we collected in Layer 2 enables.
 */
export function LearnerBriefing({
  difficulty,
  summary,
  cachedBriefing,
  onBack,
  onStart,
  onBriefingReady,
}: LearnerBriefingProps) {
  const [briefing, setBriefing] = useState<CoachBriefing | null>(cachedBriefing)
  const [loading, setLoading] = useState(false)
  const [errored, setErrored] = useState(false)

  // Generate a briefing if we don't have one yet, or if the cached one is stale
  useEffect(() => {
    const stale =
      !cachedBriefing ||
      cachedBriefing.difficulty !== difficulty ||
      Date.now() - cachedBriefing.generatedAt > 30 * 60_000 // 30 min cache

    if (stale) {
      void generate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function generate() {
    setLoading(true)
    setErrored(false)
    try {
      const res = await fetch("/api/coach/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty,
          totalSessions: summary.totalSessions,
          totalWordsCompleted: summary.totalWordsCompleted,
          bestStreak: summary.bestStreak,
          masteredCount: summary.masteredCount,
          learningCount: summary.learningCount,
          newCount: summary.newCount,
          dueForReviewCount: summary.dueForReviewCount,
          strugglingWords: summary.strugglingWords.map((s) => ({
            word: s.word,
            definition: s.definition,
            missRate: s.misses / Math.max(1, s.exposures),
          })),
          recentlyMastered: summary.recentlyMastered.map((s) => s.word),
        }),
      })
      if (!res.ok) throw new Error("Briefing failed")
      const data = (await res.json()) as CoachBriefing
      setBriefing(data)
      onBriefingReady(data)
    } catch (err) {
      console.error("[v0] briefing error:", err)
      setErrored(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-6 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-2s" }}
        />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <LayerBadge layer={3} label="System learning" />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <Brain className="w-8 h-8 text-emerald-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200 bg-clip-text text-transparent">
              Coach Briefing
            </h1>
          </div>
          <p className="text-purple-200/70 text-sm">
            What the system has learned about your play, calibrated for this session.
          </p>
        </div>

        {/* Briefing card */}
        <Card className="glass border-emerald-400/30 mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-emerald-200 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Personal note
                {briefing?.source === "fallback" && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-300/80 bg-amber-500/10 border border-amber-400/30 rounded-full px-2 py-0.5"
                    title="AI Gateway unavailable — briefing was generated from your stats with deterministic rules instead of an LLM."
                  >
                    <CloudOff className="w-3 h-3" />
                    Offline mode
                  </span>
                )}
              </CardTitle>
              {!loading && (
                <Button
                  onClick={generate}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                  title="Regenerate briefing"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading && !briefing && (
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-white/10 rounded animate-pulse" />
              </div>
            )}
            {!loading && briefing && (
              <>
                <p className="text-white/85 leading-relaxed">{briefing.message}</p>
                <div className="mt-4 flex items-start gap-2 bg-amber-500/10 border border-amber-400/20 rounded-lg px-4 py-3">
                  <Target className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs uppercase tracking-wide text-amber-300/80 font-semibold mb-1">
                      Today&apos;s focus
                    </div>
                    <p className="text-white/85 text-sm">{briefing.todayFocus}</p>
                  </div>
                </div>
              </>
            )}
            {errored && !briefing && (
              <p className="text-amber-200/80 text-sm">
                Coach is offline right now — your stats are still being tracked. You can jump straight in.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Focus words */}
        {briefing && briefing.focusWords.length > 0 && (
          <Card className="glass border-amber-400/30 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-200 text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Memory hooks for words you&apos;re working on
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {briefing.focusWords.map((fw) => (
                  <div
                    key={fw.word}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="text-xl font-bold text-amber-200 tracking-wide uppercase">
                        {fw.word}
                      </div>
                      <div className="text-xs text-white/50">{fw.definition}</div>
                    </div>
                    <p className="text-sm text-white/70 italic mb-2">
                      &ldquo;{fw.exampleSentence}&rdquo;
                    </p>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-1" />
                      <p className="text-sm text-amber-100/90">{fw.memoryHook}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats grid */}
        <Card className="glass-dark border-white/10 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-white/80 text-base">What the system has on you</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Words mastered" value={summary.masteredCount} accent="text-emerald-300" />
              <Stat label="Still learning" value={summary.learningCount} accent="text-amber-300" />
              <Stat label="Due for review" value={summary.dueForReviewCount} accent="text-purple-300" />
              <Stat label="Best streak" value={summary.bestStreak} accent="text-rose-300" />
            </div>
          </CardContent>
        </Card>

        {/* Start button */}
        <div className="flex justify-center">
          <Button
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-10 py-6 text-lg shadow-lg shadow-emerald-900/40"
          >
            <Play className="w-5 h-5 mr-2" />
            Begin session
          </Button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="bg-black/20 rounded-lg p-3 text-center border border-white/5">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-[11px] text-white/50 uppercase tracking-wide mt-1">{label}</div>
    </div>
  )
}
