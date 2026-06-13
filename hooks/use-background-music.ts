"use client"

import { useCallback, useRef, useState, useEffect } from "react"

// Your custom music tracks - expanded playlist
const MUSIC_TRACKS = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EngTet%202-e4CJG4IJ24TXKtlOqKw9da2xPwogUu.mp3",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EngTet%203-V0U6xCrTFypLN1S3VhjMdSVH6dFdZZ.mp3",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EngTet%204-QlfmamLfGpZm5h4GbV2eCItaDD2orm.mp3",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EngTet%205-YTwHSnag18mChEE8OVmKXJTLiBajSw.mp3",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EngTet%206-FzIVu5UB4JKhCD7xgRRnVPx8WDGTmn.mp3",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/lit%201-hwUqcVAKtFRgOZnwfqQ8m6QPSM4LXJ.mp3",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hard-2ZiJGD3ygUF2wuALbMrkg0SMM0HDhT.mp3",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/49.8sRecording%28Apr5%4011_56PM%29%28AddInstrumental%29-BJT927bTEJVlpn26ToboXIHt1vdLVq.mp3",
]

export interface BackgroundMusicApi {
  isPlaying: boolean
  currentTrack: number
  volume: number
  play: () => void
  pause: () => void
  toggle: () => void
  nextTrack: () => void
  setVolume: (volume: number) => void
}

export function useBackgroundMusic(initialVolume = 0.3): BackgroundMusicApi {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [volume, setVolumeState] = useState(initialVolume)
  const currentTrackRef = useRef(0)
  const isPlayingRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { currentTrackRef.current = currentTrack }, [currentTrack])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  // Initialize audio element
  useEffect(() => {
    if (typeof window === "undefined") return

    const audio = new Audio()
    audio.loop = false
    audio.volume = initialVolume
    audio.preload = "auto"
    audioRef.current = audio
    audio.src = MUSIC_TRACKS[0]

    const handleEnded = () => {
      const nextIndex = (currentTrackRef.current + 1) % MUSIC_TRACKS.length
      setCurrentTrack(nextIndex)
      audio.src = MUSIC_TRACKS[nextIndex]
      if (isPlayingRef.current) {
        audio.play().catch(console.warn)
      }
    }

    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("ended", handleEnded)
      audio.pause()
      audio.src = ""
    }
  }, [])

  // Update audio source when track changes
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.src = MUSIC_TRACKS[currentTrack]
    if (isPlaying) {
      audioRef.current.play().catch(console.warn)
    }
  }, [currentTrack])

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const play = useCallback(() => {
    if (!audioRef.current) return
    
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch((error) => {
        console.warn("Could not play audio:", error)
        // Browser may require user interaction first
      })
  }, [])

  const pause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const nextTrack = useCallback(() => {
    const nextIndex = (currentTrack + 1) % MUSIC_TRACKS.length
    setCurrentTrack(nextIndex)
  }, [currentTrack])

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)
  }, [])

  return {
    isPlaying,
    currentTrack,
    volume,
    play,
    pause,
    toggle,
    nextTrack,
    setVolume,
  }
}
