"use client"

import { useState, useEffect } from "react"
import { TetrisGame } from "@/components/tetris-game"
import { MobileTetrisGame } from "@/components/mobile-tetris-game"
import { MainMenu } from "@/components/main-menu"

export default function Home() {
  const [gameMode, setGameMode] = useState<"menu" | "game">("menu")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect if device is mobile
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isSmallScreen = window.innerWidth <= 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const startGame = (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty)
    setGameMode("game")
  }

  const backToMenu = () => {
    setGameMode("menu")
  }

  return (
    <main className="min-h-screen">
      {gameMode === "menu" ? (
        <MainMenu onStartGame={startGame} />
      ) : isMobile ? (
        <MobileTetrisGame difficulty={difficulty} onBackToMenu={backToMenu} />
      ) : (
        <TetrisGame difficulty={difficulty} onBackToMenu={backToMenu} />
      )}
    </main>
  )
}
