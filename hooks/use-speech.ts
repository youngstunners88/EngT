"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export type SpeakApi = {
  isSupported: boolean
  voicesReady: boolean
  speakLetters: (word: string) => void
  speakWord: (word: string) => void
  speakSpelling: (word: string) => void
  cancelSpeech: () => void
}

export function useSpeech(preferredLang = "en-US"): SpeakApi {
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voicesReady, setVoicesReady] = useState(false)

  const getSynth = useCallback(() => {
    if (typeof window === "undefined") return null
    if (!("speechSynthesis" in window)) return null
    if (!synthRef.current) synthRef.current = window.speechSynthesis
    return synthRef.current
  }, [])

  // Load voices (asynchronously on some browsers)
  useEffect(() => {
    const synth = getSynth()
    if (!synth) return

    function loadVoices() {
      const list = synth.getVoices()
      if (list && list.length) {
        setVoices(list)
        setVoicesReady(true)
      }
    }

    loadVoices()
    synth.onvoiceschanged = loadVoices
    return () => {
      if (synth) synth.onvoiceschanged = null
    }
  }, [getSynth])

  const pickVoice = useCallback(
    (lang: string) => {
      // Prefer en-US female if available, otherwise any en-US, otherwise first voice
      const candidates = voices.filter((v) => v.lang?.toLowerCase().startsWith(lang.toLowerCase()))
      const female =
        candidates.find((v) => /female/i.test(v.name)) ||
        candidates.find((v) => /samantha|allison|karen|victoria|serena/i.test(v.name))
      return female || candidates[0] || voices[0] || null
    },
    [voices],
  )

  const sanitize = (word: string) => (word || "").replace(/[^a-zA-Z]/g, "").trim()

  const speak = useCallback(
    (text: string, rate = 1, pitch = 1) => {
      const synth = getSynth()
      if (!synth || !text) return
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = preferredLang
      utter.rate = rate
      utter.pitch = pitch
      const voice = pickVoice(preferredLang)
      if (voice) utter.voice = voice
      synth.speak(utter)
      return utter
    },
    [getSynth, pickVoice, preferredLang],
  )

  const cancelSpeech = useCallback(() => {
    const synth = getSynth()
    synth?.cancel()
  }, [getSynth])

  const speakLetters = useCallback(
    (word: string) => {
      const clean = sanitize(word)
      if (!clean) return
      cancelSpeech()
      speak(clean.toUpperCase().split("").join(" "), 0.95, 1)
    },
    [cancelSpeech, speak],
  )

  const speakWord = useCallback(
    (word: string) => {
      const clean = sanitize(word)
      if (!clean) return
      speak(clean, 0.98, 1)
    },
    [speak],
  )

  const speakSpelling = useCallback(
    (word: string) => {
      const clean = sanitize(word)
      if (!clean) return
      const synth = getSynth()
      if (!synth) return
      cancelSpeech()
      const lettersText = clean.toUpperCase().split("").join(" ")
      const first = new SpeechSynthesisUtterance(lettersText)
      first.lang = preferredLang
      first.rate = 0.95
      first.pitch = 1
      const voice = pickVoice(preferredLang)
      if (voice) first.voice = voice

      first.onend = () => {
        const second = new SpeechSynthesisUtterance(clean)
        second.lang = preferredLang
        second.rate = 0.98
        second.pitch = 1
        if (voice) second.voice = voice
        synth.speak(second)
      }

      synth.speak(first)
    },
    [cancelSpeech, getSynth, pickVoice, preferredLang],
  )

  return useMemo(
    () => ({
      isSupported: typeof window !== "undefined" && "speechSynthesis" in window,
      voicesReady,
      speakLetters,
      speakWord,
      speakSpelling,
      cancelSpeech,
    }),
    [voicesReady, speakLetters, speakWord, speakSpelling, cancelSpeech],
  )
}
