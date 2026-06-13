"use client"

import type React from "react"
import { useCallback, useRef } from "react"

// Define interfaces for type safety
interface TouchPosition {
  x: number
  y: number
  time: number
}

interface TouchControlsProps {
  onMoveLeft: () => void
  onMoveRight: () => void
  onRotate: () => void
  onSoftDrop: () => void
  onHardDrop: () => void
}

interface TouchControlHandlers {
  handleTouchStart: (event: React.TouchEvent) => void
  handleTouchMove: (event: React.TouchEvent) => void
  handleTouchEnd: (event: React.TouchEvent) => void
}

// Constants
const SWIPE_THRESHOLD = 30
const THROTTLE_MS = 150
const TAP_THRESHOLD = 20
const TAP_TIME_THRESHOLD = 200
const HARD_DROP_THRESHOLD = 100
const HARD_DROP_TIME_THRESHOLD = 300

export function useTouchControls({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
}: TouchControlsProps): TouchControlHandlers {
  const touchStartRef = useRef<TouchPosition | null>(null)
  const lastMoveTimeRef = useRef<number>(0)

  const handleTouchStart = useCallback((event: React.TouchEvent): void => {
    event.preventDefault()
    const touch = event.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
  }, [])

  const handleTouchMove = useCallback(
    (event: React.TouchEvent): void => {
      event.preventDefault()
      if (!touchStartRef.current) return

      const touch = event.touches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const now = Date.now()

      // Throttle move events to prevent too rapid movement
      if (now - lastMoveTimeRef.current < THROTTLE_MS) return

      // Horizontal swipe for left/right movement
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0) {
          onMoveRight()
        } else {
          onMoveLeft()
        }
        lastMoveTimeRef.current = now
        touchStartRef.current.x = touch.clientX // Update start position for continuous movement
      }

      // Vertical swipe down for soft drop
      if (deltaY > SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX)) {
        onSoftDrop()
        lastMoveTimeRef.current = now
        touchStartRef.current.y = touch.clientY // Update start position
      }
    },
    [onMoveLeft, onMoveRight, onSoftDrop],
  )

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent): void => {
      event.preventDefault()
      if (!touchStartRef.current) return

      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const deltaTime = Date.now() - touchStartRef.current.time

      // Quick tap for rotation
      if (Math.abs(deltaX) < TAP_THRESHOLD && Math.abs(deltaY) < TAP_THRESHOLD && deltaTime < TAP_TIME_THRESHOLD) {
        onRotate()
      }

      // Fast downward swipe for hard drop
      if (
        deltaY > HARD_DROP_THRESHOLD &&
        deltaTime < HARD_DROP_TIME_THRESHOLD &&
        Math.abs(deltaY) > Math.abs(deltaX) * 2
      ) {
        onHardDrop()
      }

      touchStartRef.current = null
    },
    [onRotate, onHardDrop],
  )

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
