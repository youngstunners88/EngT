/**
 * Storage abstraction for the learner profile.
 *
 * The whole point of putting this behind an interface is the same point the coach makes:
 * we want to swap the layer below (localStorage now) for a richer one later (Supabase)
 * without touching any of the Layer 2 / Layer 3 code that uses it.
 */

import type { CoachBriefing, LearnerEvent, LearnerProfile, WordStat } from "@/types/learner"

const STORAGE_KEY = "english-tetris.learner.v1"
const MAX_EVENTS = 200

export interface LearnerStore {
  load(): Promise<LearnerProfile>
  save(profile: LearnerProfile): Promise<void>
  reset(): Promise<LearnerProfile>
  appendEvent(event: LearnerEvent): Promise<LearnerProfile>
  upsertWordStat(stat: WordStat): Promise<LearnerProfile>
  setBriefing(briefing: CoachBriefing | null): Promise<LearnerProfile>
}

function emptyProfile(): LearnerProfile {
  const now = Date.now()
  return {
    id: cryptoRandomId(),
    createdAt: now,
    updatedAt: now,
    totalSessions: 0,
    totalWordsCompleted: 0,
    bestStreak: 0,
    wordStats: {},
    recentEvents: [],
    lastBriefing: null,
  }
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `learner-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

/**
 * localStorage-backed implementation. Synchronous under the hood, but we wrap it
 * in promises so the call sites are already shaped for Supabase.
 */
class LocalLearnerStore implements LearnerStore {
  async load(): Promise<LearnerProfile> {
    if (typeof window === "undefined") return emptyProfile()
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const profile = emptyProfile()
        await this.save(profile)
        return profile
      }
      const parsed = JSON.parse(raw) as LearnerProfile
      // Migration safety: ensure required fields exist
      if (!parsed.wordStats) parsed.wordStats = {}
      if (!parsed.recentEvents) parsed.recentEvents = []
      if (parsed.lastBriefing === undefined) parsed.lastBriefing = null
      return parsed
    } catch (error) {
      console.error("[v0] LearnerStore load failed, resetting:", error)
      const profile = emptyProfile()
      await this.save(profile)
      return profile
    }
  }

  async save(profile: LearnerProfile): Promise<void> {
    if (typeof window === "undefined") return
    profile.updatedAt = Date.now()
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch (error) {
      console.error("[v0] LearnerStore save failed:", error)
    }
  }

  async reset(): Promise<LearnerProfile> {
    const profile = emptyProfile()
    await this.save(profile)
    return profile
  }

  async appendEvent(event: LearnerEvent): Promise<LearnerProfile> {
    const profile = await this.load()
    const next = [...profile.recentEvents, event]
    profile.recentEvents = next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next
    await this.save(profile)
    return profile
  }

  async upsertWordStat(stat: WordStat): Promise<LearnerProfile> {
    const profile = await this.load()
    profile.wordStats[stat.wordId] = stat
    await this.save(profile)
    return profile
  }

  async setBriefing(briefing: CoachBriefing | null): Promise<LearnerProfile> {
    const profile = await this.load()
    profile.lastBriefing = briefing
    await this.save(profile)
    return profile
  }
}

/**
 * Supabase-ready stub. Swap this in once Supabase is connected:
 *
 *   1. Replace the localStorage calls with `supabase.from('learner_profiles')...`
 *   2. Authenticate the user in `app/layout.tsx` and pass `userId` into the store.
 *   3. Mirror this exact `LearnerStore` interface — no other code needs to change.
 *
 * The interface IS the contract. That is the Layer 2 abstraction at work.
 */
export function createLearnerStore(): LearnerStore {
  return new LocalLearnerStore()
}
