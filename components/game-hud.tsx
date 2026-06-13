"use client"

import type { GameState } from "@/types/game"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, Target, Trophy, TrendingUp, Star, Sparkles } from "lucide-react"

interface GameHUDProps {
  gameState: GameState
  onSpeakWord?: (word: string) => void
}

export function GameHUD({ gameState, onSpeakWord }: GameHUDProps) {
  return (
    <div className="space-y-4">
      {/* Target Word - Primary Focus */}
      <Card className="relative overflow-hidden border-2 border-amber-400/50 shadow-xl animate-glow-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-200/30 to-transparent" />
        
        <CardHeader className="pb-2 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-amber-800 text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Target Word
            </CardTitle>
            {onSpeakWord && (
              <Button
                size="sm"
                variant="outline"
                className="bg-white/70 hover:bg-white text-amber-700 border-amber-400 hover:border-amber-500 shadow-sm"
                onClick={() => onSpeakWord(gameState.targetWord.word)}
                aria-label="Hear the target word"
              >
                <Volume2 className="w-4 h-4 mr-1.5" />
                Listen
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="relative pb-5">
          <div className="text-center">
            {/* Main Word Display */}
            <div className="relative inline-block">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-700 via-violet-600 to-purple-800 tracking-wider mb-3 animate-subtle-bounce">
                {gameState.targetWord.word.toUpperCase()}
              </div>
              <Sparkles className="absolute -right-6 -top-2 w-5 h-5 text-amber-500 animate-float" />
            </div>
            
            {/* Definition */}
            <div className="text-sm text-amber-900/80 mb-4 bg-white/50 backdrop-blur-sm px-4 py-2.5 rounded-lg shadow-inner border border-amber-200/50">
              {gameState.targetWord.definition}
            </div>
            
            {/* Hints */}
            <div className="text-xs text-purple-700 font-medium">
              Spell in any direction to score
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Stats */}
      <Card className="glass-dark border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white/80 text-base font-medium flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{gameState.score.toLocaleString()}</div>
              <div className="text-xs text-white/50 uppercase tracking-wide">Score</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{gameState.wordsCompleted}</div>
              <div className="text-xs text-white/50 uppercase tracking-wide">Words</div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-white/60">
            <span>Level</span>
            <span className="font-semibold text-blue-400">{gameState.level}</span>
          </div>
          <div className="flex justify-between text-sm text-white/60">
            <span>Lines Cleared</span>
            <span className="font-semibold text-emerald-400">{gameState.lines}</span>
          </div>
        </CardContent>
      </Card>

      {/* Next Piece Preview */}
      <Card className="glass-dark border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white/80 text-base font-medium">Next</CardTitle>
        </CardHeader>
        <CardContent>
          {gameState.nextPiece && (
            <div className="grid grid-cols-4 gap-1 w-fit mx-auto">
              {Array.from({ length: 16 }, (_, i) => {
                const row = Math.floor(i / 4)
                const col = i % 4
                const block = gameState.nextPiece!.blocks.find((b) => b.row === row && b.col === col)

                return (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold transition-all ${
                      block 
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md border border-blue-400/50" 
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    {block?.letter}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress / Streak */}
      <Card className="glass-dark border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white/80 text-base font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(gameState.streak, 5) }, (_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
                {gameState.streak > 5 && (
                  <span className="text-xs text-amber-400 ml-1">+{gameState.streak - 5}</span>
                )}
              </div>
              <span className="text-lg font-bold text-white">{gameState.streak}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(gameState.streak * 10, 100)}%` }}
              />
            </div>
            <p className="text-xs text-white/40 text-center">
              Build streaks for bonus points
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Words Mastered */}
      {gameState.learnedWords.length > 0 && (
        <Card className="glass-dark border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white/80 text-base font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Mastered ({gameState.learnedWords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
              {gameState.learnedWords
                .slice(-4)
                .reverse()
                .map((word) => (
                  <div key={word.id} className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                    <div className="text-sm font-semibold text-emerald-400">{word.word}</div>
                    <div className="text-xs text-white/40 truncate">{word.definition}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
