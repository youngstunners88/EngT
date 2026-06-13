"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createLearnerStore, type LearnerStore } from "@/lib/learner-store"
import { applyCompletion, applyExposure, applyMiss, ensureWordStat, summarize } from "@/lib/mastery"
import type { WordData } from "@/types/game"
import type { CoachBriefing, Difficulty, LearnerEvent, LearnerProfile, LearnerSummary } from "@/types/learner"

/**
 * The React surface for the learner data layer.
 *
 * Components call into this hook; they never touch localStorage or Supabase directly.
 * That keeps the storage layer swappable (Layer 2 abstraction).
 */
export function useLearner() {
  const storeRef = useRef<LearnerStore | null>(null)
  const [profile, setProfile] = useState<LearnerProfile | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  if (storeRef.current === null) {
    storeRef.current = createLearnerStore()
  }

  useEffect(() => {
    let cancelled = false
    storeRef.current!.load().then((p) => {
      if (!cancelled) {
        setProfile(p)
        setIsLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const summary: LearnerSummary | null = useMemo(() => {
    if (!profile) return null
    return summarize(profile)
  }, [profile])

  const recordWordShown = useCallback(
    async (word: WordData, difficulty: Difficulty) => {
      const store = storeRef.current!
      const current = profile ?? (await store.load())
      const now = Date.now()
      const stat = ensureWordStat(current, word, difficulty, now)
      const updated = applyExposure(stat, now)
      const next = await store.upsertWordStat(updated)
      const final = await store.appendEvent({
        type: "word_shown",
        at: now,
        wordId: word.id,
        word: word.word,
      })
      // appendEvent loaded fresh state; merge by re-reading:
      void next
      setProfile(final)
    },
    [profile],
  )

  const recordWordCompleted = useCallback(
    async (word: WordData, difficulty: Difficulty, timeToCompleteMs: number) => {
      const store = storeRef.current!
      const current = profile ?? (await store.load())
      const now = Date.now()
      const stat = ensureWordStat(current, word, difficulty, now)
      const updated = applyCompletion(stat, timeToCompleteMs, now)
      await store.upsertWordStat(updated)
      const final = await store.appendEvent({
        type: "word_completed",
        at: now,
        wordId: word.id,
        word: word.word,
        timeToCompleteMs,
      })
      final.totalWordsCompleted += 1
      await store.save(final)
      setProfile({ ...final })
    },
    [profile],
  )

  const recordWordMissed = useCallback(
    async (
      word: WordData,
      difficulty: Difficulty,
      reason: "timeout" | "game_over" | "skipped",
    ) => {
      const store = storeRef.current!
      const current = profile ?? (await store.load())
      const now = Date.now()
      const stat = ensureWordStat(current, word, difficulty, now)
      const updated = applyMiss(stat, now)
      await store.upsertWordStat(updated)
      const final = await store.appendEvent({
        type: "word_missed",
        at: now,
        wordId: word.id,
        word: word.word,
        reason,
      })
      setProfile(final)
    },
    [profile],
  )

  const recordSessionStarted = useCallback(
    async (difficulty: Difficulty) => {
      const store = storeRef.current!
      const now = Date.now()
      const final = await store.appendEvent({ type: "session_started", at: now, difficulty })
      final.totalSessions += 1
      await store.save(final)
      setProfile({ ...final })
    },
    [],
  )

  const recordSessionEnded = useCallback(
    async (difficulty: Difficulty, wordsCompleted: number, durationMs: number, bestStreakInSession: number) => {
      const store = storeRef.current!
      const now = Date.now()
      const final = await store.appendEvent({
        type: "session_ended",
        at: now,
        difficulty,
        wordsCompleted,
        durationMs,
      })
      if (bestStreakInSession > final.bestStreak) {
        final.bestStreak = bestStreakInSession
        await store.save(final)
      }
      setProfile({ ...final })
    },
    [],
  )

  const setBriefing = useCallback(async (briefing: CoachBriefing | null) => {
    const store = storeRef.current!
    const final = await store.setBriefing(briefing)
    setProfile(final)
  }, [])

  const resetProfile = useCallback(async () => {
    const store = storeRef.current!
    const fresh = await store.reset()
    setProfile(fresh)
  }, [])

  return {
    profile,
    summary,
    isLoaded,
    recordWordShown,
    recordWordCompleted,
    recordWordMissed,
    recordSessionStarted,
    recordSessionEnded,
    setBriefing,
    resetProfile,
  }
}

export type UseLearnerReturn = ReturnType<typeof useLearner>
