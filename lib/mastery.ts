/**
 * Layer 2 brain: SM-2-lite spaced repetition + smart word selection.
 *
 * This file is the difference between "random words" (Layer 1) and "words this learner
 * actually needs right now" (Layer 2). It is the flow that connects the data we capture
 * to the experience the player has next.
 */

import { WORD_LISTS } from "@/data/words"
import type { WordData } from "@/types/game"
import type { Difficulty, LearnerProfile, LearnerSummary, WordStat } from "@/types/learner"
import { bucketOf, makeNewWordStat } from "@/types/learner"

const SLOW_COMPLETION_MS = 25_000
const STRUGGLE_MISS_RATE = 0.34

/** Update a word stat after the learner completes it. */
export function applyCompletion(stat: WordStat, timeToCompleteMs: number, now: number): WordStat {
  const isSlow = timeToCompleteMs > SLOW_COMPLETION_MS
  const newCompletes = stat.completes + 1
  const newAvg = stat.avgCompleteMs
    ? Math.round((stat.avgCompleteMs * stat.completes + timeToCompleteMs) / newCompletes)
    : timeToCompleteMs

  const easiness = clamp(stat.easiness + (isSlow ? -0.05 : 0.1), 1.3, 3.0)
  const mastery = Math.min(5, stat.mastery + 1)
  const intervalMinutes =
    stat.intervalMinutes === 0 ? 5 : Math.max(5, Math.round(stat.intervalMinutes * easiness))

  return {
    ...stat,
    mastery,
    easiness,
    intervalMinutes,
    completes: newCompletes,
    avgCompleteMs: newAvg,
    lastSeenAt: now,
    nextDueAt: now + intervalMinutes * 60_000,
  }
}

/** Update a word stat after a miss. */
export function applyMiss(stat: WordStat, now: number): WordStat {
  const easiness = clamp(stat.easiness - 0.2, 1.3, 3.0)
  const mastery = Math.max(0, stat.mastery - 1)
  return {
    ...stat,
    mastery,
    easiness,
    intervalMinutes: 5,
    misses: stat.misses + 1,
    lastSeenAt: now,
    nextDueAt: now + 5 * 60_000,
  }
}

/** Update a word stat just from being shown. */
export function applyExposure(stat: WordStat, now: number): WordStat {
  return {
    ...stat,
    exposures: stat.exposures + 1,
    lastSeenAt: now,
  }
}

/**
 * The Layer 2 selector. Looks at the profile and the available pool, then picks
 * the word this learner would benefit most from seeing right now.
 *
 * Ranking:
 *   - struggling words (highest priority, large weight)
 *   - words past their review-due time
 *   - new words (haven't been seen yet)
 *   - well-mastered words (occasional reinforcement, very low weight)
 *
 * Recently-shown words are excluded to avoid repetition fatigue.
 */
export function selectNextWord(
  difficulty: Difficulty,
  profile: LearnerProfile,
  recentlyShownIds: string[],
): WordData {
  const pool = WORD_LISTS[difficulty]
  const recent = new Set(recentlyShownIds)
  const now = Date.now()

  const candidates = pool.filter((w) => !recent.has(w.id))
  const usable = candidates.length > 0 ? candidates : pool

  const weighted = usable.map((word) => {
    const stat = profile.wordStats[word.id]
    let weight = 1
    let category: "struggle" | "due" | "new" | "mastered" = "new"

    if (!stat || stat.exposures === 0) {
      weight = 3
      category = "new"
    } else {
      const missRate = stat.misses / Math.max(1, stat.exposures)
      const isStruggling = missRate >= STRUGGLE_MISS_RATE && stat.mastery < 4
      const isDue = stat.nextDueAt <= now
      const isMastered = stat.mastery >= 4

      if (isStruggling) {
        weight = 6
        category = "struggle"
      } else if (isDue && !isMastered) {
        weight = 4
        category = "due"
      } else if (isMastered) {
        weight = 0.5
        category = "mastered"
      } else {
        weight = 2
        category = "due"
      }
    }

    return { word, weight, category }
  })

  const totalWeight = weighted.reduce((sum, x) => sum + x.weight, 0)
  let r = Math.random() * totalWeight
  for (const entry of weighted) {
    r -= entry.weight
    if (r <= 0) return entry.word
  }
  return weighted[weighted.length - 1].word
}

/**
 * Make sure the profile has a word-stat row for any word the learner might see.
 * Called when a word is first shown.
 */
export function ensureWordStat(
  profile: LearnerProfile,
  word: WordData,
  difficulty: Difficulty,
  now: number,
): WordStat {
  const existing = profile.wordStats[word.id]
  if (existing) return existing
  return makeNewWordStat(word, difficulty, now)
}

/** Compute a summary the UI can render without doing aggregate work itself. */
export function summarize(profile: LearnerProfile): LearnerSummary {
  const stats = Object.values(profile.wordStats)
  const now = Date.now()

  let mastered = 0
  let learning = 0
  let dueForReview = 0
  for (const s of stats) {
    const b = bucketOf(s)
    if (b === "mastered") mastered++
    else if (b === "learning") learning++
    if (s.nextDueAt <= now && s.exposures > 0 && s.mastery < 5) dueForReview++
  }

  const totalKnownWordsAcrossDifficulties =
    WORD_LISTS.easy.length + WORD_LISTS.medium.length + WORD_LISTS.hard.length
  const newCount = totalKnownWordsAcrossDifficulties - stats.length

  const strugglingWords = stats
    .filter((s) => {
      const missRate = s.misses / Math.max(1, s.exposures)
      return missRate >= STRUGGLE_MISS_RATE && s.mastery < 4 && s.exposures >= 2
    })
    .sort((a, b) => b.misses / Math.max(1, b.exposures) - a.misses / Math.max(1, a.exposures))
    .slice(0, 5)

  const recentlyMastered = stats
    .filter((s) => s.mastery >= 4)
    .sort((a, b) => b.lastSeenAt - a.lastSeenAt)
    .slice(0, 5)

  return {
    totalWordsCompleted: profile.totalWordsCompleted,
    totalSessions: profile.totalSessions,
    bestStreak: profile.bestStreak,
    masteredCount: mastered,
    learningCount: learning,
    newCount,
    dueForReviewCount: dueForReview,
    strugglingWords,
    recentlyMastered,
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
