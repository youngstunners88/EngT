"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw, ArrowLeft, ArrowRight, ArrowDown, ChevronsDown } from "lucide-react"

interface MobileControlsProps {
  onMoveLeft: () => void
  onMoveRight: () => void
  onRotate: () => void
  onSoftDrop: () => void
  onHardDrop: () => void
  onPause: () => void
  isPaused: boolean
}

export function MobileControls({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  onPause,
  isPaused,
}: MobileControlsProps) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
      <div className="text-white text-sm mb-3 text-center">Touch Controls</div>

      {/* Main control area */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Left column */}
        <Button
          onTouchStart={(e) => {
            e.preventDefault()
            onMoveLeft()
          }}
          className="h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          size="sm"
          aria-label="Move left"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Center column */}
        <div className="flex flex-col gap-2">
          <Button
            onTouchStart={(e) => {
              e.preventDefault()
              onRotate()
            }}
            className="h-8 bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
            size="sm"
            aria-label="Rotate piece"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onTouchStart={(e) => {
              e.preventDefault()
              onSoftDrop()
            }}
            className="h-8 bg-green-600 hover:bg-green-700 active:bg-green-800"
            size="sm"
            aria-label="Soft drop"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Right column */}
        <Button
          onTouchStart={(e) => {
            e.preventDefault()
            onMoveRight()
          }}
          className="h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          size="sm"
          aria-label="Move right"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onTouchStart={(e) => {
            e.preventDefault()
            onHardDrop()
          }}
          className="h-10 bg-red-600 hover:bg-red-700 active:bg-red-800"
          size="sm"
          aria-label="Hard drop"
        >
          <ChevronsDown className="w-4 h-4 mr-1" />
          Drop
        </Button>
        <Button
          onTouchStart={(e) => {
            e.preventDefault()
            onPause()
          }}
          className="h-10 bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800"
          size="sm"
          aria-label={isPaused ? "Resume game" : "Pause game"}
        >
          {isPaused ? "Resume" : "Pause"}
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-3 text-xs text-gray-400 text-center">
        <div>Swipe: Move • Tap: Rotate • Swipe Down: Drop</div>
      </div>
    </div>
  )
}
