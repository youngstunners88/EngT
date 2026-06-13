"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Target, AlertCircle } from "lucide-react"
import type { CoachBriefing, LearnerSummary } from "@/types/learner"

interface CoachInsightProps {
  summary: LearnerSummary
  briefing: CoachBriefing | null
  currentTargetWord: string
}

/**
 * Layer 3 surface inside the live game. Shows the learner what the system
 * understands about THEIR current play right now — focus, due for review,
 * and whether the active target is one of their struggle words.
 */
export function CoachInsight({ summary, briefing, currentTargetWord }: CoachInsightProps) {
  const isStruggleWord = summary.strugglingWords.some(
    (s) => s.word.toLowerCase() === currentTargetWord.toLowerCase()
  )

  return (
    <Card className="glass-dark border-emerald-400/20">
      <CardHeader className="pb-2.5">
        <CardTitle className="text-white/80 text-base font-medium flex items-center gap-2">
          <Brain className="w-4 h-4 text-emerald-400" />
          Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {briefing && (
          <div className="flex items-start gap-2 text-xs">
            <Target className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
            <p className="text-white/70 leading-relaxed">{briefing.todayFocus}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/20 rounded-md px-2.5 py-2">
            <div className="text-[10px] text-white/40 uppercase tracking-wide">Due review</div>
            <div className="text-lg font-bold text-purple-300">{summary.dueForReviewCount}</div>
          </div>
          <div className="bg-black/20 rounded-md px-2.5 py-2">
            <div className="text-[10px] text-white/40 uppercase tracking-wide">Mastered</div>
            <div className="text-lg font-bold text-emerald-300">{summary.masteredCount}</div>
          </div>
        </div>

        {isStruggleWord && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-400/30 rounded-md px-3 py-2">
            <AlertCircle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-100/90">
              This one&apos;s been giving you trouble. Take your time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
