"use client"

import { useEffect, useState } from "react"
import type { GameState } from "@/types/game"
import { Sparkles } from "lucide-react"

interface GameBoardProps {
  gameState: GameState
  isPaused: boolean
}

export function GameBoard({ gameState, isPaused }: GameBoardProps) {
  const [animationFrame, setAnimationFrame] = useState(0)

  useEffect(() => {
    if (gameState.showWordAnimation) {
      const interval = setInterval(() => {
        setAnimationFrame((prev) => (prev + 1) % 10)
      }, 80)
      return () => clearInterval(interval)
    } else {
      setAnimationFrame(0)
    }
  }, [gameState.showWordAnimation])

  const renderCell = (row: number, col: number) => {
    const cell = gameState.board[row]?.[col]
    const isCurrentPiece =
      gameState.currentPiece &&
      gameState.currentPiece.blocks.some(
        (block) => block.row + gameState.currentPiece!.row === row && block.col + gameState.currentPiece!.col === col,
      )

    let cellContent = ""
    let cellClass = "w-8 h-8 flex items-center justify-center text-sm font-bold transition-all duration-150 letter-block "

    if (isCurrentPiece && !isPaused) {
      const block = gameState.currentPiece!.blocks.find(
        (block) => block.row + gameState.currentPiece!.row === row && block.col + gameState.currentPiece!.col === col,
      )
      cellContent = block?.letter || ""
      cellClass += "bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-md shadow-lg border border-blue-300/50"
    } else if (cell) {
      cellContent = cell.letter

      if (cell.isPartOfWord) {
        if (gameState.showWordAnimation && gameState.completedWords.length > 0) {
          const latestWord = gameState.completedWords[gameState.completedWords.length - 1]
          const isPartOfLatestWord = latestWord.positions.some((pos) => pos.row === row && pos.col === col)

          if (isPartOfLatestWord) {
            const glowClass = animationFrame % 2 === 0 ? "shadow-[0_0_20px_rgba(255,215,0,0.8)]" : "shadow-[0_0_30px_rgba(255,215,0,1)]"
            cellClass += `bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-amber-900 rounded-md ${glowClass} border-2 border-amber-300 animate-word-celebration`
          } else {
            cellClass += `${cell.color} text-white rounded-md border-2 border-emerald-400/70 shadow-md letter-block-highlight`
          }
        } else {
          cellClass += `${cell.color} text-white rounded-md border-2 border-emerald-400/50 shadow-md`
        }
      } else {
        cellClass += `${cell.color} text-white rounded-md border border-white/20 shadow-sm`
      }
    } else {
      cellClass += "bg-slate-900/60 border border-slate-700/30 rounded-sm"
    }

    return (
      <div key={`${row}-${col}`} className={cellClass}>
        {cellContent}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Board Container with elegant border */}
      <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-sm">
        {/* Inner board */}
        <div className="grid grid-cols-10 gap-0.5 bg-slate-950/50 p-2 rounded-xl border border-white/5">
          {Array.from({ length: 20 }, (_, row) => 
            Array.from({ length: 10 }, (_, col) => renderCell(row, col))
          )}
        </div>
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-2xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">PAUSED</div>
            <div className="text-sm text-white/60">Press P to resume</div>
          </div>
        </div>
      )}

      {/* Word Found Animation */}
      {gameState.showWordAnimation && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative">
            <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-900 text-3xl font-bold px-8 py-4 rounded-2xl shadow-2xl animate-bounce flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <span>Word Found!</span>
              <Sparkles className="w-8 h-8" />
            </div>
            {/* Celebratory particles */}
            <div className="absolute -top-4 -left-4 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
            <div className="absolute -top-2 -right-6 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: "0.2s" }} />
            <div className="absolute -bottom-3 -left-2 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: "0.4s" }} />
            <div className="absolute -bottom-4 -right-4 w-3 h-3 bg-amber-300 rounded-full animate-ping" style={{ animationDelay: "0.3s" }} />
          </div>
        </div>
      )}
    </div>
  )
}
