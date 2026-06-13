"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { GameState, Piece, WordData, BoardCell } from "@/types/game"
import { WORD_LISTS } from "@/data/words"
import { TETRIS_PIECES } from "@/data/pieces"

function getRandomWord(diff: "easy" | "medium" | "hard", excludeWords: WordData[]): WordData {
  const words = WORD_LISTS[diff]
  const excludeIds = new Set(excludeWords.map((word) => word.id))
  const availableWords = words.filter((word) => !excludeIds.has(word.id))
  if (availableWords.length === 0) {
    return words[Math.floor(Math.random() * words.length)]
  }
  return availableWords[Math.floor(Math.random() * availableWords.length)]
}

function getRandomLetter(targetWord: string): string {
  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const targetLetters = targetWord.toUpperCase().split("")
  if (Math.random() < 0.6 && targetLetters.length > 0) {
    return targetLetters[Math.floor(Math.random() * targetLetters.length)]
  }
  return allLetters[Math.floor(Math.random() * allLetters.length)]
}

function createRandomPiece(targetWord: string): Piece {
  const pieceTemplate = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)]
  return {
    row: pieceTemplate.row,
    col: pieceTemplate.col,
    color: pieceTemplate.color,
    blocks: pieceTemplate.blocks.map((block) => ({
      row: block.row,
      col: block.col,
      letter: getRandomLetter(targetWord),
    })),
  }
}

function canMovePiece(piece: Piece, newRow: number, newCol: number, board: (BoardCell | null)[][]): boolean {
  return piece.blocks.every((block) => {
    const boardRow = block.row + newRow
    const boardCol = block.col + newCol
    return boardRow >= 0 && boardRow < 20 && boardCol >= 0 && boardCol < 10 && board[boardRow][boardCol] === null
  })
}

export function useGameState(difficulty: "easy" | "medium" | "hard") {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialTargetWord = getRandomWord(difficulty, [])
    return {
      board: Array(20).fill(null).map(() => Array(10).fill(null)),
      currentPiece: null,
      nextPiece: createRandomPiece(initialTargetWord.word),
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      targetWord: initialTargetWord,
      wordsCompleted: 0,
      streak: 0,
      learnedWords: [],
      completedWords: [],
      showWordAnimation: false,
    }
  })

  const dropTimeRef = useRef<number>(1000)
  const lastDropRef = useRef<number>(Date.now())

  const spawnNewPiece = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece && prev.nextPiece) {
        const newPiece = prev.nextPiece
        const nextPiece = createRandomPiece(prev.targetWord.word)
        const gameOver = newPiece.blocks.some(
          (block) => prev.board[block.row + newPiece.row]?.[block.col + newPiece.col] !== null,
        )
        return {
          ...prev,
          currentPiece: gameOver ? null : newPiece,
          nextPiece,
          gameOver,
        }
      }
      return prev
    })
  }, [])

  const checkForCompletedWords = useCallback((board: (BoardCell | null)[][]) => {
    const rows = board.length
    const cols = board[0].length
    const foundWords: { word: string; positions: { row: number; col: number }[]; direction: [number, number] }[] = []
    const minWordLength = 3

    const isValidCell = (r: number, c: number) => {
      return r >= 0 && r < rows && c >= 0 && c < cols && board[r]?.[c]?.letter
    }

    const directions = [
      [0, 1], [0, -1], [1, 0], [-1, 0],
      [1, 1], [1, -1], [-1, 1], [-1, -1],
    ]

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!isValidCell(row, col)) continue
        for (const direction of directions) {
          const [dr, dc] = direction
          let word = ""
          const positions: { row: number; col: number }[] = []
          let r = row, c = col
          while (isValidCell(r, c)) {
            word += board[r][c]!.letter
            positions.push({ row: r, col: c })
            r += dr
            c += dc
          }
          if (word.length >= minWordLength) {
            foundWords.push({ word, positions, direction: [dr, dc] })
          }
        }
      }
    }
    return foundWords
  }, [])

  const highlightCompletedWord = useCallback(
    (board: (BoardCell | null)[][], positions: { row: number; col: number }[], wordId: string) => {
      const newBoard = board.map((row) => [...row])
      positions.forEach(({ row, col }) => {
        if (newBoard[row][col]) {
          newBoard[row][col] = { ...newBoard[row][col]!, isPartOfWord: true, wordId }
        }
      })
      return newBoard
    },
    [],
  )

  const placePiece = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece) return prev

      const newBoard = prev.board.map((row) => [...row])
      prev.currentPiece.blocks.forEach((block) => {
        const boardRow = block.row + prev.currentPiece!.row
        const boardCol = block.col + prev.currentPiece!.col
        if (boardRow >= 0 && boardRow < 20 && boardCol >= 0 && boardCol < 10) {
          newBoard[boardRow][boardCol] = {
            letter: block.letter,
            color: prev.currentPiece!.color,
          }
        }
      })

      const completedLines: number[] = []
      for (let row = 0; row < 20; row++) {
        if (newBoard[row].every((cell) => cell !== null)) {
          completedLines.push(row)
        }
      }
      completedLines.forEach((lineIndex) => {
        newBoard.splice(lineIndex, 1)
        newBoard.unshift(Array(10).fill(null))
      })

      const foundWords = checkForCompletedWords(newBoard)
      let newScore = prev.score + completedLines.length * 100 * prev.level
      let newStreak = prev.streak
      let newWordsCompleted = prev.wordsCompleted
      const newLearnedWords = [...prev.learnedWords]
      let newTargetWord = prev.targetWord
      const newCompletedWords = [...prev.completedWords]
      let showAnimation = false

      const targetWord = prev.targetWord.word.toUpperCase()
      const reversedTargetWord = targetWord.split("").reverse().join("")

      const targetWordMatch = foundWords.find((found) => {
        const upperWord = found.word.toUpperCase()
        return upperWord.includes(targetWord) || upperWord.includes(reversedTargetWord)
      })

      if (targetWordMatch) {
        const wordId = `word-${Date.now()}`
        const highlightedBoard = highlightCompletedWord(newBoard, targetWordMatch.positions, wordId)
        newCompletedWords.push({
          word: prev.targetWord.word,
          positions: targetWordMatch.positions,
          direction: targetWordMatch.direction,
          timestamp: Date.now(),
        })
        newScore += 500 * (newStreak + 1)
        newStreak += 1
        newWordsCompleted += 1
        newLearnedWords.push(prev.targetWord)
        showAnimation = true
        newTargetWord = getRandomWord(difficulty, newLearnedWords)

        return {
          ...prev,
          board: highlightedBoard,
          currentPiece: null,
          score: newScore,
          lines: prev.lines + completedLines.length,
          level: Math.floor((prev.lines + completedLines.length) / 10) + 1,
          streak: newStreak,
          wordsCompleted: newWordsCompleted,
          learnedWords: newLearnedWords,
          targetWord: newTargetWord,
          completedWords: newCompletedWords,
          showWordAnimation: showAnimation,
        }
      }

      return {
        ...prev,
        board: newBoard,
        currentPiece: null,
        score: newScore,
        lines: prev.lines + completedLines.length,
        level: Math.floor((prev.lines + completedLines.length) / 10) + 1,
      }
    })
  }, [difficulty, checkForCompletedWords, highlightCompletedWord])

  useEffect(() => {
    if (gameState.showWordAnimation) {
      const timer = setTimeout(() => {
        setGameState((prev) => ({ ...prev, showWordAnimation: false }))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameState.showWordAnimation])

  const movePiece = useCallback(
    (direction: "left" | "right" | "down") => {
      setGameState((prev) => {
        if (!prev.currentPiece || prev.gameOver) return prev
        const deltaCol = direction === "left" ? -1 : direction === "right" ? 1 : 0
        const deltaRow = direction === "down" ? 1 : 0
        const newRow = prev.currentPiece.row + deltaRow
        const newCol = prev.currentPiece.col + deltaCol
        if (canMovePiece(prev.currentPiece, newRow, newCol, prev.board)) {
          return {
            ...prev,
            currentPiece: { ...prev.currentPiece, row: newRow, col: newCol },
          }
        } else if (direction === "down") {
          lastDropRef.current = Date.now()
          setTimeout(placePiece, 0)
        }
        return prev
      })
    },
    [placePiece],
  )

  const rotatePiece = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver) return prev
      const rotatedBlocks = prev.currentPiece.blocks.map((block) => ({
        ...block,
        row: block.col,
        col: -block.row,
      }))
      const rotatedPiece = { ...prev.currentPiece, blocks: rotatedBlocks }
      if (canMovePiece(rotatedPiece, prev.currentPiece.row, prev.currentPiece.col, prev.board)) {
        return { ...prev, currentPiece: rotatedPiece }
      }
      return prev
    })
  }, [])

  const dropPiece = useCallback(() => {
    movePiece("down")
  }, [movePiece])

  const hardDrop = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver) return prev
      let newRow = prev.currentPiece.row
      while (canMovePiece(prev.currentPiece, newRow + 1, prev.currentPiece.col, prev.board)) {
        newRow++
      }
      const droppedPiece = { ...prev.currentPiece, row: newRow }
      lastDropRef.current = Date.now()
      setTimeout(placePiece, 0)
      return { ...prev, currentPiece: droppedPiece }
    })
  }, [placePiece])

  const completeTargetWord = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameOver) return prev
      const newStreak = prev.streak + 1
      const newWordsCompleted = prev.wordsCompleted + 1
      const newLearnedWords = [...prev.learnedWords, prev.targetWord]
      const newTargetWord = getRandomWord(difficulty, newLearnedWords)
      const newScore = prev.score + 500 * newStreak
      return {
        ...prev,
        score: newScore,
        streak: newStreak,
        wordsCompleted: newWordsCompleted,
        learnedWords: newLearnedWords,
        targetWord: newTargetWord,
        completedWords: [...prev.completedWords, {
          word: prev.targetWord.word,
          positions: [],
          direction: [0, 0] as [number, number],
          timestamp: Date.now(),
        }],
        showWordAnimation: true,
      }
    })
  }, [difficulty])

  const resetGame = useCallback(() => {
    const newTargetWord = getRandomWord(difficulty, [])
    lastDropRef.current = Date.now()
    setGameState({
      board: Array(20).fill(null).map(() => Array(10).fill(null)),
      currentPiece: null,
      nextPiece: createRandomPiece(newTargetWord.word),
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      targetWord: newTargetWord,
      wordsCompleted: 0,
      streak: 0,
      learnedWords: [],
      completedWords: [],
      showWordAnimation: false,
    })
  }, [difficulty])

  // Game loop using refs to avoid stale closures
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const now = Date.now()
      if (now - lastDropRef.current > dropTimeRef.current) {
        lastDropRef.current = now
        setGameState((prev) => {
          if (prev.gameOver) return prev
          if (prev.currentPiece) {
            const deltaCol = 0
            const deltaRow = 1
            const newRow = prev.currentPiece.row + deltaRow
            const newCol = prev.currentPiece.col + deltaCol
            if (canMovePiece(prev.currentPiece, newRow, newCol, prev.board)) {
              return {
                ...prev,
                currentPiece: { ...prev.currentPiece, row: newRow, col: newCol },
              }
            } else {
              setTimeout(placePiece, 0)
              return prev
            }
          } else if (prev.nextPiece) {
            const newPiece = prev.nextPiece
            const nextPiece = createRandomPiece(prev.targetWord.word)
            const gameOver = newPiece.blocks.some(
              (block) => prev.board[block.row + newPiece.row]?.[block.col + newPiece.col] !== null,
            )
            return {
              ...prev,
              currentPiece: gameOver ? null : newPiece,
              nextPiece,
              gameOver,
            }
          }
          return prev
        })
      }
    }, 50)
    return () => clearInterval(gameLoop)
  }, [placePiece])

  // Adjust drop speed based on level
  useEffect(() => {
    const baseSpeed = difficulty === "easy" ? 1000 : difficulty === "medium" ? 800 : 600
    dropTimeRef.current = Math.max(baseSpeed - (gameState.level - 1) * 50, 100)
  }, [gameState.level, difficulty])

  return {
    gameState,
    actions: {
      movePiece,
      rotatePiece,
      dropPiece,
      hardDrop,
      resetGame,
      completeTargetWord,
      spawnNewPiece,
    },
  }
}
