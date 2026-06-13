"use client"

import { useState, useEffect, useCallback } from "react"
import type { GameState, Piece, WordData, BoardCell } from "@/types/game"
import { WORD_LISTS } from "@/data/words"
import { TETRIS_PIECES } from "@/data/pieces"

export function useGameState(difficulty: "easy" | "medium" | "hard") {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialTargetWord = getRandomWord(difficulty, [])
    return {
      board: Array(20)
        .fill(null)
        .map(() => Array(10).fill(null)),
      currentPiece: null,
      nextPiece: null,
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

  const [dropTime, setDropTime] = useState<number>(1000)
  const [lastDrop, setLastDrop] = useState<number>(Date.now())
  const [usedWordIds, setUsedWordIds] = useState<Set<string>>(new Set())

  function getRandomWord(diff: "easy" | "medium" | "hard", excludeWords: WordData[]): WordData {
    const words = WORD_LISTS[diff]
    const excludeIds = new Set(excludeWords.map((word) => word.id))

    // Filter out words that have already been used
    const availableWords = words.filter((word) => !excludeIds.has(word.id))

    // If all words have been used, reset and use all words again
    if (availableWords.length === 0) {
      console.log("All words used, resetting pool")
      return words[Math.floor(Math.random() * words.length)]
    }

    const selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)]
    console.log(`Selected word: ${selectedWord.word}, Available: ${availableWords.length}`)
    return selectedWord
  }

  function getRandomLetter(targetWord: string): string {
    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const targetLetters = targetWord.toUpperCase().split("")

    // 60% chance to get a letter from the target word
    // 40% chance to get any random letter
    if (Math.random() < 0.6 && targetLetters.length > 0) {
      return targetLetters[Math.floor(Math.random() * targetLetters.length)]
    } else {
      return allLetters[Math.floor(Math.random() * allLetters.length)]
    }
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

  const spawnNewPiece = useCallback(() => {
    setGameState((prev) => {
      const newPiece = prev.nextPiece || createRandomPiece(prev.targetWord.word)
      const nextPiece = createRandomPiece(prev.targetWord.word)

      // Check if game over
      const gameOver = newPiece.blocks.some(
        (block) => prev.board[block.row + newPiece.row]?.[block.col + newPiece.col] !== null,
      )

      return {
        ...prev,
        currentPiece: gameOver ? null : newPiece,
        nextPiece,
        gameOver,
      }
    })
  }, [])

  const checkForCompletedWords = useCallback((board: (BoardCell | null)[][]) => {
    const rows = board.length
    const cols = board[0].length
    const foundWords: { word: string; positions: { row: number; col: number }[]; direction: [number, number] }[] = []
    const minWordLength = 3

    // Helper function to check if a cell is valid and has a letter
    const isValidCell = (r: number, c: number) => {
      return r >= 0 && r < rows && c >= 0 && c < cols && board[r][c]?.letter
    }

    // Check in all 8 directions: horizontal, vertical, and diagonal
    const directions = [
      [0, 1], // right
      [0, -1], // left
      [1, 0], // down
      [-1, 0], // up
      [1, 1], // down-right
      [1, -1], // down-left
      [-1, 1], // up-right
      [-1, -1], // up-left
    ]

    // For each cell in the board
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Skip empty cells
        if (!isValidCell(row, col)) continue

        // Check in all 8 directions
        for (const direction of directions) {
          const [dr, dc] = direction
          let word = ""
          const positions: { row: number; col: number }[] = []
          let r = row
          let c = col

          // Build word in this direction
          while (isValidCell(r, c)) {
            word += board[r][c]!.letter
            positions.push({ row: r, col: c })
            r += dr
            c += dc
          }

          // Add word if it's long enough
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
      const newBoard = [...board.map((row) => [...row])]

      positions.forEach(({ row, col }) => {
        if (newBoard[row][col]) {
          newBoard[row][col] = {
            ...newBoard[row][col]!,
            isPartOfWord: true,
            wordId,
          }
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

      // Place the piece on the board
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

      // Check for completed lines
      const completedLines: number[] = []
      for (let row = 0; row < 20; row++) {
        if (newBoard[row].every((cell) => cell !== null)) {
          completedLines.push(row)
        }
      }

      // Remove completed lines
      completedLines.forEach((lineIndex) => {
        newBoard.splice(lineIndex, 1)
        newBoard.unshift(Array(10).fill(null))
      })

      // Check for completed words
      const foundWords = checkForCompletedWords(newBoard)
      let newScore = prev.score + completedLines.length * 100 * prev.level
      let newStreak = prev.streak
      let newWordsCompleted = prev.wordsCompleted
      const newLearnedWords = [...prev.learnedWords]
      let newTargetWord = prev.targetWord
      const newCompletedWords = [...prev.completedWords]
      let showAnimation = false

      // Check if target word was spelled (forward or backward)
      const targetWord = prev.targetWord.word.toUpperCase()
      const reversedTargetWord = targetWord.split("").reverse().join("")

      const targetWordMatch = foundWords.find((found) => {
        const upperWord = found.word.toUpperCase()
        return upperWord.includes(targetWord) || upperWord.includes(reversedTargetWord)
      })

      if (targetWordMatch) {
        // Highlight the word on the board
        const wordId = `word-${Date.now()}`
        const highlightedBoard = highlightCompletedWord(newBoard, targetWordMatch.positions, wordId)

        // Add to completed words list
        newCompletedWords.push({
          word: prev.targetWord.word,
          positions: targetWordMatch.positions,
          direction: targetWordMatch.direction,
          timestamp: Date.now(),
        })

        // Update game stats
        newScore += 500 * (newStreak + 1)
        newStreak += 1
        newWordsCompleted += 1
        newLearnedWords.push(prev.targetWord)
        showAnimation = true

        // Get a new target word that hasn't been used before
        newTargetWord = getRandomWord(difficulty, newLearnedWords)

        return {
          ...prev,
          board: highlightedBoard,
          currentPiece: null,
          score: newScore,
          lines: prev.lines + completedLines.length,
          level: Math.floor(prev.lines / 10) + 1,
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
        level: Math.floor(prev.lines / 10) + 1,
      }
    })
  }, [difficulty, checkForCompletedWords, highlightCompletedWord])

  // Hide animation after a delay
  useEffect(() => {
    if (gameState.showWordAnimation) {
      const timer = setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          showWordAnimation: false,
        }))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameState.showWordAnimation])

  const canMovePiece = useCallback((piece: Piece, newRow: number, newCol: number, board: any[][]) => {
    return piece.blocks.every((block) => {
      const boardRow = block.row + newRow
      const boardCol = block.col + newCol
      return boardRow >= 0 && boardRow < 20 && boardCol >= 0 && boardCol < 10 && board[boardRow][boardCol] === null
    })
  }, [])

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
            currentPiece: {
              ...prev.currentPiece,
              row: newRow,
              col: newCol,
            },
          }
        } else if (direction === "down") {
          // Piece can't move down, place it
          setTimeout(placePiece, 0)
        }

        return prev
      })
    },
    [canMovePiece, placePiece],
  )

  const rotatePiece = useCallback(() => {
    setGameState((prev) => {
      if (!prev.currentPiece || prev.gameOver) return prev

      // Simple rotation: rotate 90 degrees clockwise
      const rotatedBlocks = prev.currentPiece.blocks.map((block) => ({
        ...block,
        row: block.col,
        col: -block.row,
      }))

      const rotatedPiece = {
        ...prev.currentPiece,
        blocks: rotatedBlocks,
      }

      if (canMovePiece(rotatedPiece, prev.currentPiece.row, prev.currentPiece.col, prev.board)) {
        return {
          ...prev,
          currentPiece: rotatedPiece,
        }
      }

      return prev
    })
  }, [canMovePiece])

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

      const droppedPiece = {
        ...prev.currentPiece,
        row: newRow,
      }

      setTimeout(placePiece, 0)

      return {
        ...prev,
        currentPiece: droppedPiece,
      }
    })
  }, [canMovePiece, placePiece])

  const resetGame = useCallback(() => {
    const newTargetWord = getRandomWord(difficulty, [])
    setUsedWordIds(new Set())
    setGameState({
      board: Array(20)
        .fill(null)
        .map(() => Array(10).fill(null)),
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
    setLastDrop(Date.now())
  }, [difficulty])

  // Game loop for automatic piece dropping
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const now = Date.now()
      if (now - lastDrop > dropTime) {
        if (gameState.currentPiece && !gameState.gameOver) {
          dropPiece()
        } else if (!gameState.currentPiece && !gameState.gameOver) {
          spawnNewPiece()
        }
        setLastDrop(now)
      }
    }, 50)

    return () => clearInterval(gameLoop)
  }, [gameState.currentPiece, gameState.gameOver, dropTime, lastDrop, dropPiece, spawnNewPiece])

  // Adjust drop speed based on level
  useEffect(() => {
    const baseSpeed = difficulty === "easy" ? 1000 : difficulty === "medium" ? 800 : 600
    setDropTime(Math.max(baseSpeed - (gameState.level - 1) * 50, 100))
  }, [gameState.level, difficulty])

  return {
    gameState,
    actions: {
      movePiece,
      rotatePiece,
      dropPiece,
      hardDrop,
      resetGame,
    },
  }
}
