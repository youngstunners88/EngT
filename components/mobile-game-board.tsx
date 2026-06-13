"use client"

import { useEffect, useState } from "react"
import type { GameState } from "@/types/game"
import { useTouchControls } from "@/hooks/use-touch-controls"
import { Sparkles } from "lucide-react"

interface MobileGameBoardProps {
  gameState: GameState
  isPaused: boolean
  onMoveLeft: () => void
  onMoveRight: () => void
  onRotate: () => void
  onSoftDrop: () => void
  onHardDrop: () => void
}

export function MobileGameBoard({
  gameState,
  isPaused,
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
}: MobileGameBoardProps) {
  const [animationFrame, setAnimationFrame] = useState(0)

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchControls({
    onMoveLeft,
    onMoveRight,
    onRotate,
    onSoftDrop,
    onHardDrop,
  })

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
    let cellClass = "w-6 h-6 flex items-center justify-center text-xs font-bold transition-all duration-150 "

    if (isCurrentPiece && !isPaused) {
      const block = gameState.currentPiece!.blocks.find(
        (block) => block.row + gameState.currentPiece!.row === row && block.col + gameState.currentPiece!.col === col,
      )
      cellContent = block?.letter || ""
      cellClass += "bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-sm shadow-md border border-blue-300/50"
    } else if (cell) {
      cellContent = cell.letter

      if (cell.isPartOfWord) {
        if (gameState.showWordAnimation && gameState.completedWords?.length > 0) {
          const latestWord = gameState.completedWords[gameState.completedWords.length - 1]
          const isPartOfLatestWord = latestWord.positions.some((pos) => pos.row === row && pos.col === col)

          if (isPartOfLatestWord) {
            const glowClass = animationFrame % 2 === 0 ? "shadow-[0_0_15px_rgba(255,215,0,0.8)]" : "shadow-[0_0_25px_rgba(255,215,0,1)]"
            cellClass += `bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-amber-900 rounded-sm ${glowClass} border border-amber-300`
          } else {
            cellClass += `${cell.color} text-white rounded-sm border border-emerald-400/70 shadow-sm`
          }
        } else {
          cellClass += `${cell.color} text-white rounded-sm border border-emerald-400/50 shadow-sm`
        }
      } else {
        cellClass += `${cell.color} text-white rounded-sm border border-white/20`
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
      <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-3 rounded-xl border border-white/10 shadow-xl touch-none">
        <div
          className="grid grid-cols-10 gap-0.5 bg-slate-950/50 p-1.5 rounded-lg border border-white/5 select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {Array.from({ length: 20 }, (_, row) => 
            Array.from({ length: 10 }, (_, col) => renderCell(row, col))
          )}
        </div>
      </div>

      {isPaused && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="text-xl font-bold text-white">PAUSED</div>
        </div>
      )}

      {gameState.showWordAnimation && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-900 text-xl font-bold px-6 py-3 rounded-xl shadow-xl animate-bounce flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Word Found!
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  )
}
