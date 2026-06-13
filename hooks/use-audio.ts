"use client"

import { useCallback, useRef, useMemo } from "react"

// Define interface for audio functions
interface AudioFunctions {
  playSuccessCheer: () => void
  playVictoryFanfare: () => void
  playEncouragement: () => void
  playLineClear: () => void
  playPieceDrop: () => void
  playPieceRotate: () => void
  playPieceMove: () => void
  playBackgroundMusic: () => void
  stopBackgroundMusic: () => void
  playAmbientTones: () => void
}

// Musical note frequencies (in Hz)
const NOTES = {
  // Octave 3
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  // Octave 4
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  // Octave 5
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
  B5: 987.77,
  // Octave 6
  C6: 1046.5,
}

export function useAudio(): AudioFunctions {
  const audioContextRef = useRef<AudioContext | null>(null)
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const ambientIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const getAudioContext = useCallback((): AudioContext | null => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      return audioContextRef.current
    } catch (error) {
      console.warn("Web Audio API not supported:", error)
      return null
    }
  }, [])

  // Utility function to validate audio parameters
  const isValidAudioParam = useCallback((value: number): boolean => {
    return typeof value === "number" && isFinite(value) && !isNaN(value) && value > 0
  }, [])

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3, delay = 0): void => {
      try {
        // Validate all parameters
        if (!isValidAudioParam(frequency) || !isValidAudioParam(duration) || !isValidAudioParam(volume)) {
          console.warn("Invalid audio parameters:", { frequency, duration, volume })
          return
        }

        // Clamp values to safe ranges
        const safeFrequency = Math.max(20, Math.min(20000, frequency))
        const safeDuration = Math.max(0.01, Math.min(10, duration))
        const safeVolume = Math.max(0, Math.min(1, volume))
        const safeDelay = Math.max(0, delay)

        const audioContext = getAudioContext()
        if (!audioContext) return

        const playSound = () => {
          try {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(safeFrequency, audioContext.currentTime)
            oscillator.type = type

            // Set gain with smooth envelope
            gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            gainNode.gain.linearRampToValueAtTime(safeVolume, audioContext.currentTime + 0.05)
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + safeDuration - 0.05)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + safeDuration)
          } catch (error) {
            console.warn("Error playing tone:", error)
          }
        }

        if (safeDelay > 0) {
          setTimeout(playSound, safeDelay)
        } else {
          playSound()
        }
      } catch (error) {
        console.warn("Audio playback failed:", error)
      }
    },
    [getAudioContext, isValidAudioParam],
  )

  const playChord = useCallback(
    (frequencies: number[], duration: number, volume = 0.1, delay = 0): void => {
      if (!Array.isArray(frequencies) || frequencies.length === 0) {
        console.warn("Invalid frequencies array:", frequencies)
        return
      }

      const validFrequencies = frequencies.filter((freq) => isValidAudioParam(freq))
      if (validFrequencies.length === 0) {
        console.warn("No valid frequencies in chord:", frequencies)
        return
      }

      const chordVolume = volume / validFrequencies.length
      validFrequencies.forEach((freq) => {
        playTone(freq, duration, "sine", chordVolume, delay)
      })
    },
    [playTone, isValidAudioParam],
  )

  // Return memoized audio functions to prevent unnecessary re-renders
  return useMemo(
    () => ({
      playSuccessCheer: () => {
        // Play a celebratory ascending chord progression
        const notes = [
          { freq: NOTES.C5, delay: 0 },
          { freq: NOTES.E5, delay: 100 },
          { freq: NOTES.G5, delay: 200 },
          { freq: NOTES.C6, delay: 300 },
        ]

        notes.forEach(({ freq, delay }) => {
          playTone(freq, 0.4, "triangle", 0.4, delay)
        })

        // Add some sparkle with higher frequency tones
        setTimeout(() => {
          for (let i = 0; i < 8; i++) {
            setTimeout(() => {
              const sparkleFreq = 1500 + Math.random() * 800
              playTone(sparkleFreq, 0.15, "sine", 0.2)
            }, i * 60)
          }
        }, 400)
      },

      playVictoryFanfare: () => {
        // More elaborate victory sound
        const melody = [
          { freq: NOTES.C5, delay: 0, duration: 0.2 },
          { freq: NOTES.E5, delay: 200, duration: 0.2 },
          { freq: NOTES.G5, delay: 400, duration: 0.2 },
          { freq: NOTES.C6, delay: 600, duration: 0.4 },
          { freq: NOTES.G5, delay: 1000, duration: 0.2 },
          { freq: NOTES.C6, delay: 1200, duration: 0.6 },
        ]

        melody.forEach(({ freq, delay, duration }) => {
          playTone(freq, duration, "triangle", 0.5, delay)
        })

        // Add celebratory bells
        setTimeout(() => {
          for (let i = 0; i < 12; i++) {
            setTimeout(() => {
              const bellFreq = 2000 + Math.random() * 1000
              playTone(bellFreq, 0.3, "sine", 0.15)
            }, i * 100)
          }
        }, 800)
      },

      playEncouragement: () => {
        // Encouraging "ding" sound
        const notes = [
          { freq: NOTES.A5, delay: 0 },
          { freq: NOTES.C6, delay: 100 },
          { freq: NOTES.E5, delay: 200 },
        ]

        notes.forEach(({ freq, delay }) => {
          playTone(freq, 0.3, "sine", 0.3, delay)
        })
      },

      playLineClear: () => {
        playTone(800, 0.2, "square", 0.2)
      },

      playPieceDrop: () => {
        playTone(200, 0.1, "square", 0.1)
      },

      playPieceRotate: () => {
        playTone(400, 0.05, "triangle", 0.1)
      },

      playPieceMove: () => {
        playTone(300, 0.03, "square", 0.05)
      },

      playBackgroundMusic: () => {
        // Clear any existing music interval
        if (musicIntervalRef.current) {
          clearInterval(musicIntervalRef.current)
          musicIntervalRef.current = null
        }

        try {
          let measureCount = 0
          const beatsPerMinute = 120
          const beatDuration = (60 / beatsPerMinute) * 1000 // milliseconds per beat
          const measureDuration = beatDuration * 4 // 4/4 time signature

          // Validate timing values
          if (!isValidAudioParam(beatDuration) || !isValidAudioParam(measureDuration)) {
            console.warn("Invalid timing values for background music")
            return
          }

          // Classical chord progressions in C major
          const chordProgressions = [
            // Progression 1: I-vi-IV-V (C-Am-F-G)
            [
              [NOTES.C4, NOTES.E4, NOTES.G4], // C major
              [NOTES.A3, NOTES.C4, NOTES.E4], // A minor
              [NOTES.F3, NOTES.A3, NOTES.C4], // F major
              [NOTES.G3, NOTES.B3, NOTES.D4], // G major
            ],
            // Progression 2: I-V-vi-IV (C-G-Am-F)
            [
              [NOTES.C4, NOTES.E4, NOTES.G4], // C major
              [NOTES.G3, NOTES.B3, NOTES.D4], // G major
              [NOTES.A3, NOTES.C4, NOTES.E4], // A minor
              [NOTES.F3, NOTES.A3, NOTES.C4], // F major
            ],
          ]

          // Melody patterns that work over the chord progressions
          const melodyPatterns = [
            // Pattern 1: Gentle ascending and descending
            [NOTES.C5, NOTES.D5, NOTES.E5, NOTES.D5, NOTES.C5, NOTES.B4, NOTES.A4, NOTES.G4],
            // Pattern 2: Arpeggiated
            [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.E5, NOTES.C5, NOTES.G4, NOTES.C5, NOTES.E5],
          ]

          const playMeasure = () => {
            try {
              const progressionIndex = Math.floor(measureCount / 4) % chordProgressions.length
              const chordIndex = measureCount % 4
              const currentChords = chordProgressions[progressionIndex]
              const currentChord = currentChords[chordIndex]

              // Validate chord data
              if (!Array.isArray(currentChord) || currentChord.length === 0) {
                console.warn("Invalid chord data:", currentChord)
                return
              }

              // Play chord (bass notes)
              playChord(currentChord, measureDuration / 1000, 0.08)

              // Play melody on beats 1 and 3
              const melodyIndex = Math.floor(measureCount / 8) % melodyPatterns.length
              const melody = melodyPatterns[melodyIndex]

              if (!Array.isArray(melody) || melody.length === 0) {
                console.warn("Invalid melody data:", melody)
                return
              }

              const noteIndex = (measureCount * 2) % melody.length

              // Beat 1
              if (melody[noteIndex] && isValidAudioParam(melody[noteIndex])) {
                playTone(melody[noteIndex], beatDuration / 1000, "sine", 0.06)
              }

              // Beat 3
              setTimeout(() => {
                const nextNoteIndex = (noteIndex + 1) % melody.length
                if (melody[nextNoteIndex] && isValidAudioParam(melody[nextNoteIndex])) {
                  playTone(melody[nextNoteIndex], beatDuration / 1000, "sine", 0.06)
                }
              }, beatDuration * 2)

              measureCount++
            } catch (error) {
              console.warn("Error in playMeasure:", error)
            }
          }

          // Start the musical loop
          playMeasure() // Play immediately
          musicIntervalRef.current = setInterval(playMeasure, measureDuration)
        } catch (error) {
          console.warn("Error starting background music:", error)
        }
      },

      stopBackgroundMusic: () => {
        try {
          if (musicIntervalRef.current) {
            clearInterval(musicIntervalRef.current)
            musicIntervalRef.current = null
          }
          if (ambientIntervalRef.current) {
            clearTimeout(ambientIntervalRef.current)
            ambientIntervalRef.current = null
          }
          console.log("Background music stopped")
        } catch (error) {
          console.warn("Error stopping background music:", error)
        }
      },

      playAmbientTones: () => {
        try {
          // Clear any existing ambient interval
          if (ambientIntervalRef.current) {
            clearTimeout(ambientIntervalRef.current)
            ambientIntervalRef.current = null
          }

          // Soft ambient bells that complement the main music
          const ambientNotes = [NOTES.C6, NOTES.E5, NOTES.G5, NOTES.A5, NOTES.F5]

          const playRandomAmbient = () => {
            try {
              if (Math.random() < 0.25) {
                // 25% chance every interval
                const note = ambientNotes[Math.floor(Math.random() * ambientNotes.length)]
                if (isValidAudioParam(note)) {
                  playTone(note, 2.0, "sine", 0.03)
                }
              }
            } catch (error) {
              console.warn("Error playing ambient tone:", error)
            }
          }

          // Play ambient tones every 6-10 seconds
          const scheduleNext = () => {
            try {
              const delay = 6000 + Math.random() * 4000
              ambientIntervalRef.current = setTimeout(() => {
                playRandomAmbient()
                scheduleNext()
              }, delay)
            } catch (error) {
              console.warn("Error scheduling ambient tone:", error)
            }
          }

          scheduleNext()
        } catch (error) {
          console.warn("Error starting ambient tones:", error)
        }
      },
    }),
    [playTone, playChord, isValidAudioParam],
  )
}
