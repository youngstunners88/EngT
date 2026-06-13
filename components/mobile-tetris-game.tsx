"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { MobileGameBoard } from "./mobile-game-board"
import { MobileControls } from "./mobile-controls"
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
  Home, RotateCcw, SkipForward, Sparkles
} from "lucide-react"

interface MobileTetrisGameProps {
  difficulty: "easy" | "medium" | "hard"
  onBackToMenu: () => void
}

export function MobileTetrisGame({ difficulty, onBackToMenu }: MobileTetrisGameProps) {
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
  const prevLinesRef = useRef(gameState.lines)

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

  // Line clear effect
  useEffect(() => {
    if (audioEnabled && gameState.lines > prevLinesRef.current) audio.playLineClear()
    prevLinesRef.current = gameState.lines
  }, [gameState.lines, audioEnabled, audio])

  const handleParticleComplete = useCallback(() => {
    setParticleTrigger(null)
  }, [])

  const handleMoveLeft = useCallback(() => {
    actions.movePiece("left")
    if (audioEnabled) audio.playPieceMove()
  }, [actions, audioEnabled, audio])

  const handleMoveRight = useCallback(() => {
    actions.movePiece("right")
    if (audioEnabled) audio.playPieceMove()
  }, [actions, audioEnabled, audio])

  const handleRotate = useCallback(() => {
    actions.rotatePiece()
    if (audioEnabled) audio.playPieceRotate()
  }, [actions, audioEnabled, audio])

  const handleSoftDrop = useCallback(() => {
    actions.dropPiece()
    if (audioEnabled) audio.playPieceDrop()
  }, [actions, audioEnabled, audio])

  const handleHardDrop = useCallback(() => {
    actions.hardDrop()
    if (audioEnabled) audio.playPieceDrop()
  }, [actions, audioEnabled, audio])

  const handlePause = useCallback(() => setIsPaused((p) => !p), [])

  const handleSpeakWord = useCallback((word: string) => {
    if (voice.isEnabled) {
      voice.spellWord(word)
    }
  }, [voice])

  const getDifficultyConfig = (diff: string) => {
    switch (diff) {
      case "easy":
        return { color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Beginner" }
      case "medium":
        return { color: "text-amber-400", bg: "bg-amber-500/20", label: "Intermediate" }
      case "hard":
        return { color: "text-rose-400", bg: "bg-rose-500/20", label: "Advanced" }
      default:
        return { color: "text-white", bg: "bg-white/20", label: diff }
    }
  }

  const diffConfig = getDifficultyConfig(difficulty)

  return (
    <div className="min-h-screen p-3 overflow-hidden relative">
      {/* Evolving Background - subtly changes every 7 minutes */}
      <EvolvingBackground />
      
      {/* Particle Effects Layer */}
      <ParticleEffects trigger={particleTrigger} onComplete={handleParticleComplete} />

      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
                Letter Tetris
              </h1>
            </div>
            <div className={`text-xs font-medium ${diffConfig.color} mt-0.5`}>{diffConfig.label}</div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button
              onClick={() => setAudioEnabled((v) => !v)}
              variant="outline"
              size="sm"
              className={`${
                audioEnabled ? "bg-emerald-600/80 border-emerald-500" : "bg-slate-700/80 border-slate-600"
              } text-white h-8 w-8 p-0 transition-all duration-300`}
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </Button>
            
            <Button
              onClick={() => music.toggle()}
              variant="outline"
              size="sm"
              className={`${
                music.isPlaying ? "bg-purple-600/80 border-purple-500" : "bg-slate-700/80 border-slate-600"
              } text-white h-8 w-8 p-0 transition-all duration-300`}
            >
              {music.isPlaying ? <Music className="w-3.5 h-3.5" /> : <Music2 className="w-3.5 h-3.5" />}
            </Button>

            {music.isPlaying && (
              <Button
                onClick={() => music.nextTrack()}
                variant="outline"
                size="sm"
                className="bg-slate-700/80 border-slate-600 text-white h-8 w-8 p-0 transition-all duration-300"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </Button>
            )}
            
            <Button
              onClick={() => voice.toggleVoice()}
              variant="outline"
              size="sm"
              className={`${
                voice.isEnabled ? "bg-teal-600/80 border-teal-500" : "bg-slate-700/80 border-slate-600"
              } text-white h-8 w-8 p-0 transition-all duration-300`}
            >
              {voice.isEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </Button>
            
            <Button 
              onClick={onBackToMenu} 
              size="sm" 
              className="bg-blue-600/80 text-white h-8 px-3 transition-all duration-300"
            >
              <Home className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Game Board */}
        <div className="mb-4">
          <MobileGameBoard
            gameState={gameState}
            isPaused={isPaused}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            onRotate={handleRotate}
            onSoftDrop={handleSoftDrop}
            onHardDrop={handleHardDrop}
          />
        </div>

        {/* Status Messages */}
        {isPaused && !gameState.gameOver && (
          <div className="mb-4 text-center">
            <div className="inline-block bg-amber-500/90 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg animate-pulse">
              PAUSED
            </div>
          </div>
        )}
        {gameState.gameOver && (
          <div className="mb-4 text-center">
            <div className="inline-block bg-rose-500/90 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg">
              GAME OVER
            </div>
          </div>
        )}

        {/* HUD */}
        <div className="mb-4">
          <GameHUD
            gameState={gameState}
            onSpeakWord={handleSpeakWord}
          />
        </div>

        {/* Controls */}
        <div className="mb-4">
          <MobileControls
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            onRotate={handleRotate}
            onSoftDrop={handleSoftDrop}
            onHardDrop={handleHardDrop}
            onPause={handlePause}
            isPaused={isPaused}
          />
        </div>

        {/* Reset */}
        <Button 
          onClick={actions.resetGame} 
          className="w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg transition-all duration-300" 
          size="lg"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Game
        </Button>

        {/* Instructions */}
        <div className="mt-4 glass-dark p-4 rounded-xl">
          <h3 className="text-white/80 text-sm font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Touch Controls
          </h3>
          <div className="text-white/50 text-xs space-y-1">
            <div>Swipe left/right to move</div>
            <div>Tap to rotate</div>
            <div>Swipe down for soft/hard drop</div>
          </div>
        </div>
      </div>
    </div>
  )
}
