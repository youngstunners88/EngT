"use client"

import { useCallback, useRef, useState } from "react"

const VOICE_ID = "EXAVITQu4vr4xnSDxMaL" // Sarah - clear, friendly voice
const API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

type VoicePhrase = {
  text: string
  emotion?: "neutral" | "excited" | "encouraging" | "celebratory"
}

const ACHIEVEMENT_PHRASES = {
  wordComplete: [
    "Excellent work!",
    "Well done!",
    "Perfect spelling!",
    "You got it!",
    "Fantastic!",
    "Great job!",
  ],
  streak: [
    "Amazing streak!",
    "You're on fire!",
    "Unstoppable!",
    "Keep it going!",
    "Incredible!",
  ],
  levelUp: [
    "Level up! You're getting smarter!",
    "New level achieved!",
    "Congratulations on leveling up!",
  ],
  mistake: [
    "Keep trying!",
    "You can do it!",
    "Almost there!",
    "Don't give up!",
  ],
  gameOver: [
    "Great game! You learned so much!",
    "Well played! Ready to try again?",
  ],
}

export function useElevenLabsVoice() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(true)
  const audioQueueRef = useRef<string[]>([])
  const isPlayingRef = useRef(false)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  const playNextInQueue = useCallback(async () => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current) {
      return
    }

    isPlayingRef.current = true
    const audioUrl = audioQueueRef.current.shift()

    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl)
        currentAudioRef.current = audio
        audio.volume = 0.8

        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve()
          audio.onerror = () => reject()
          audio.play().catch(reject)
        })
      } catch (error) {
        console.error("[v0] Audio playback error:", error)
      }
    }

    isPlayingRef.current = false
    currentAudioRef.current = null
    playNextInQueue()
  }, [])

  const speak = useCallback(
    async (text: string) => {
      if (!isEnabled || !text) return

      setIsLoading(true)

      try {
        const response = await fetch("/api/elevenlabs/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId: VOICE_ID }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate speech")
        }

        const contentType = response.headers.get("Content-Type") || ""
        if (!contentType.includes("audio")) {
          throw new Error("Response was not audio")
        }

        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        audioQueueRef.current.push(audioUrl)
        playNextInQueue()
      } catch (error) {
        // ElevenLabs unreachable from this environment — gracefully use the
        // browser's built-in speech synthesis so voice still works.
        console.warn("[v0] ElevenLabs unavailable, using browser voice fallback:", error)
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.rate = 0.9
          utterance.pitch = 1
          window.speechSynthesis.speak(utterance)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [isEnabled, playNextInQueue]
  )

  const spellWord = useCallback(
    async (word: string) => {
      if (!isEnabled || !word) return

      const cleanWord = word.toUpperCase().replace(/[^A-Z]/g, "")
      if (!cleanWord) return

      // Spell out letters then say the word
      const letters = cleanWord.split("").join(". ")
      const fullText = `${letters}. ${word}.`

      await speak(fullText)
    },
    [isEnabled, speak]
  )

  const celebrateWordComplete = useCallback(
    async (word: string) => {
      if (!isEnabled) return

      const phrases = ACHIEVEMENT_PHRASES.wordComplete
      const phrase = phrases[Math.floor(Math.random() * phrases.length)]

      // First spell the word, then celebrate
      const cleanWord = word.toUpperCase().replace(/[^A-Z]/g, "")
      const letters = cleanWord.split("").join(". ")
      const fullText = `${letters}. ${word}. ${phrase}`

      await speak(fullText)
    },
    [isEnabled, speak]
  )

  const celebrateStreak = useCallback(
    async (streakCount: number) => {
      if (!isEnabled) return

      const phrases = ACHIEVEMENT_PHRASES.streak
      const phrase = phrases[Math.floor(Math.random() * phrases.length)]
      await speak(`${streakCount} words in a row! ${phrase}`)
    },
    [isEnabled, speak]
  )

  const celebrateLevelUp = useCallback(
    async (level: number) => {
      if (!isEnabled) return

      const phrases = ACHIEVEMENT_PHRASES.levelUp
      const phrase = phrases[Math.floor(Math.random() * phrases.length)]
      await speak(`Level ${level}! ${phrase}`)
    },
    [isEnabled, speak]
  )

  const encourageOnMistake = useCallback(async () => {
    if (!isEnabled) return

    const phrases = ACHIEVEMENT_PHRASES.mistake
    const phrase = phrases[Math.floor(Math.random() * phrases.length)]
    await speak(phrase)
  }, [isEnabled, speak])

  const announceGameOver = useCallback(
    async (wordsLearned: number) => {
      if (!isEnabled) return

      const phrases = ACHIEVEMENT_PHRASES.gameOver
      const phrase = phrases[Math.floor(Math.random() * phrases.length)]
      await speak(`Game over! You learned ${wordsLearned} words. ${phrase}`)
    },
    [isEnabled, speak]
  )

  const stopSpeaking = useCallback(() => {
    audioQueueRef.current = []
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    isPlayingRef.current = false
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const toggleVoice = useCallback(() => {
    setIsEnabled((prev) => !prev)
  }, [])

  return {
    isEnabled,
    isLoading,
    toggleVoice,
    speak,
    spellWord,
    celebrateWordComplete,
    celebrateStreak,
    celebrateLevelUp,
    encourageOnMistake,
    announceGameOver,
    stopSpeaking,
  }
}
