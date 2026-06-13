"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { GameBoard } from "./game-board"
import { GameHUD } from "./game-hud"
import { ParticleEffects } from "./particle-effects"
import { EvolvingBackground } from "./evolving-background"
import { useGameState } from "@/hooks/use-game-state"
import { useAudio } from "@/hooks/use-audio"
import { useElevenLabsVoice } from "@/hooks/use-elevenlabs-voice"
import { useBackgroundMusic } from "@/hooks/use-background-music"
import { Button } from "@/components/ui/button"
import { 
  Volume2, VolumeX, Music, Music2, Mic, MicOff, 
  Pause, Play, RotateCcw, Home, SkipForward,
  Sparkles
} from "lucide-react"

interface TetrisGameProps {
  difficulty: "easy" | "medium" | "hard"
  onBackToMenu: () => void
}

export function TetrisGame({ difficulty, onBackToMenu }: TetrisGameProps) {
  const { gameState, actions } = useGameState(difficulty)
  const audio = useAudio()
  const voice = useElevenLabsVoice()
  const music = useBackgroundMusic(0.25)
  const [isPaused, setIsPaused] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [particleTrigger, setParticleTrigger] = useState<"word-complete" | "streak" | "level-up" | "game-over" | null>(null)

  const prevWordsCompletedRef = useRef(gameState.wordsCompleted)
  const prevStreakRef = useRef(gameState.streak)
  const prevLevelRef = useRef(gameState.level)
  const prevGameOverRef = useRef(gameState.gameOver)

  // Word completion effects with particles and voice
  useEffect(() => {
    if (gameState.wordsCompleted > prevWordsCompletedRef.current) {
      if (audioEnabled) audio.playSuccessCheer()
      
      const lastWord = gameState.completedWords?.[gameState.completedWords.length - 1]
      
      // Check if it's a streak (3+ words)
      if (gameState.streak >= 3 && gameState.streak > prevStreakRef.current) {
        setParticleTrigger("streak")
        if (voice.isEnabled) {
          voice.celebrateStreak(gameState.streak)
        }
      } else {
        setParticleTrigger("word-complete")
        if (voice.isEnabled && lastWord?.word) {
          voice.celebrateWordComplete(lastWord.word)
        }
      }
    }
    prevWordsCompletedRef.current = gameState.wordsCompleted
    prevStreakRef.current = gameState.streak
  }, [gameState.wordsCompleted, gameState.streak, gameState.completedWords, audioEnabled, audio, voice])

  // Level up effects
  useEffect(() => {
    if (gameState.level > prevLevelRef.current) {
      setParticleTrigger("level-up")
      if (voice.isEnabled) {
        voice.celebrateLevelUp(gameState.level)
      }
    }
    prevLevelRef.current = gameState.level
  }, [gameState.level, voice])

  // Game over effects
  useEffect(() => {
    if (gameState.gameOver && !prevGameOverRef.current) {
      setParticleTrigger("game-over")
      if (voice.isEnabled) {
        voice.announceGameOver(gameState.learnedWords.length)
      }
    }
    prevGameOverRef.current = gameState.gameOver
  }, [gameState.gameOver, gameState.learnedWords.length, voice])

  // Clear particle trigger after animation
  const handleParticleComplete = useCallback(() => {
    setParticleTrigger(null)
  }, [])

  // Keyboard controls
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (gameState.gameOver) {
        if (event.key === "r" || event.key === "R") actions.resetGame()
        return
      }
      if (isPaused && event.key.toLowerCase() !== "p") return

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault()
          actions.movePiece("left")
          break
        case "ArrowRight":
          event.preventDefault()
          actions.movePiece("right")
          break
        case "ArrowUp":
          event.preventDefault()
          actions.rotatePiece()
          if (audioEnabled) audio.playPieceRotate()
          break
        case "ArrowDown":
          event.preventDefault()
          actions.dropPiece()
          if (audioEnabled) audio.playPieceDrop()
          break
        case " ":
          event.preventDefault()
          actions.hardDrop()
          if (audioEnabled) audio.playPieceDrop()
          break
        case "p":
        case "P":
          event.preventDefault()
          setIsPaused((p) => !p)
          break
        case "r":
        case "R":
          event.preventDefault()
          actions.resetGame()
          break
        case "m":
        case "M":
          event.preventDefault()
          music.toggle()
          break
      }
    },
    [gameState.gameOver, isPaused, actions, audioEnabled, audio, music],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  // Line clear sfx
  const prevLinesRef = useRef(gameState.lines)
  useEffect(() => {
    if (audioEnabled && gameState.lines > prevLinesRef.current) audio.playLineClear()
    prevLinesRef.current = gameState.lines
  }, [gameState.lines, audioEnabled, audio])

  const getDifficultyConfig = (diff: string) => {
    switch (diff) {
      case "easy":
        return { color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", label: "Beginner" }
      case "medium":
        return { color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", label: "Intermediate" }
      case "hard":
        return { color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30", label: "Advanced" }
      default:
        return { color: "text-white", bg: "bg-white/20", border: "border-white/30", label: diff }
    }
  }

  const diffConfig = getDifficultyConfig(difficulty)

  const handleSpeakWord = useCallback((word: string) => {
    if (voice.isEnabled) {
      voice.spellWord(word)
    }
  }, [voice])

  return (
    <div className="min-h-screen p-4 overflow-hidden relative">
      {/* Evolving Background - subtly changes every 7 minutes */}
      <EvolvingBackground />
      
      {/* Particle Effects Layer */}
      <ParticleEffects trigger={particleTrigger} onComplete={handleParticleComplete} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                Letter Tetris
              </h1>
            </div>
            <div className={`px-3 py-1.5 rounded-full ${diffConfig.bg} ${diffConfig.border} border backdrop-blur-sm`}>
              <span className={`text-sm font-medium ${diffConfig.color}`}>{diffConfig.label}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Sound Effects Toggle */}
            <Button
              onClick={() => setAudioEnabled((v) => !v)}
              variant="outline"
              size="sm"
              className={`${
                audioEnabled 
                  ? "bg-emerald-600/80 border-emerald-500 hover:bg-emerald-500" 
                  : "bg-slate-700/80 border-slate-600 hover:bg-slate-600"
              } text-white backdrop-blur-sm transition-all duration-300`}
              title="Toggle sound effects"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            {/* Music Toggle */}
            <Button
              onClick={() => music.toggle()}
              variant="outline"
              size="sm"
              className={`${
                music.isPlaying 
                  ? "bg-purple-600/80 border-purple-500 hover:bg-purple-500" 
                  : "bg-slate-700/80 border-slate-600 hover:bg-slate-600"
              } text-white backdrop-blur-sm transition-all duration-300`}
              title="Toggle background music (M)"
            >
              {music.isPlaying ? <Music className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}
            </Button>

            {/* Next Track */}
            {music.isPlaying && (
              <Button
                onClick={() => music.nextTrack()}
                variant="outline"
                size="sm"
                className="bg-slate-700/80 border-slate-600 hover:bg-slate-600 text-white backdrop-blur-sm transition-all duration-300"
                title="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            )}

            {/* Voice Toggle */}
            <Button
              onClick={() => voice.toggleVoice()}
              variant="outline"
              size="sm"
              className={`${
                voice.isEnabled 
                  ? "bg-teal-600/80 border-teal-500 hover:bg-teal-500" 
                  : "bg-slate-700/80 border-slate-600 hover:bg-slate-600"
              } text-white backdrop-blur-sm transition-all duration-300`}
              title="Toggle ElevenLabs voice"
            >
              {voice.isEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>

            <div className="w-px h-6 bg-white/20 mx-1" />

            {/* Pause */}
            <Button
              onClick={() => setIsPaused((p) => !p)}
              variant="outline"
              size="sm"
              className="bg-amber-600/80 border-amber-500 hover:bg-amber-500 text-white backdrop-blur-sm transition-all duration-300"
              title="Pause (P)"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>

            {/* Reset */}
            <Button
              onClick={actions.resetGame}
              variant="outline"
              size="sm"
              className="bg-rose-600/80 border-rose-500 hover:bg-rose-500 text-white backdrop-blur-sm transition-all duration-300"
              title="Reset (R)"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* Menu */}
            <Button
              onClick={onBackToMenu}
              size="sm"
              className="bg-blue-600/80 border-blue-500 hover:bg-blue-500 text-white backdrop-blur-sm transition-all duration-300"
            >
              <Home className="w-4 h-4 mr-1.5" />
              Menu
            </Button>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex gap-6 justify-center">
          <div className="flex-shrink-0">
            <GameBoard gameState={gameState} isPaused={isPaused} />
            
            {/* Game Status Messages */}
            {isPaused && !gameState.gameOver && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-amber-500/90 text-white px-6 py-3 rounded-xl font-semibold shadow-lg backdrop-blur-sm animate-pulse">
                  <Pause className="w-5 h-5" />
                  PAUSED - Press P to Resume
                </div>
              </div>
            )}
            {gameState.gameOver && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-rose-500/90 text-white px-6 py-3 rounded-xl font-semibold shadow-lg backdrop-blur-sm">
                  GAME OVER - Press R to Restart
                </div>
              </div>
            )}
          </div>

          {/* HUD */}
          <div className="w-80">
            <GameHUD
              gameState={gameState}
              onSpeakWord={handleSpeakWord}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 glass-dark rounded-2xl p-6">
          <h3 className="text-white/90 text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Controls
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-white/60 text-sm">
            <div className="space-y-2">
              <p><kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Arrow Left/Right</kbd> Move piece</p>
              <p><kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Arrow Up</kbd> Rotate</p>
              <p><kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Arrow Down</kbd> Soft drop</p>
              <p><kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Space</kbd> Hard drop</p>
            </div>
            <div className="space-y-2">
              <p><kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">P</kbd> Pause/Resume</p>
              <p><kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">M</kbd> Toggle music</p>
              <p><kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">R</kbd> Reset game</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
