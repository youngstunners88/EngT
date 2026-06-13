export interface Block {
  row: number
  col: number
  letter: string
}

export interface BoardCell {
  letter: string
  color: string
  isPartOfWord?: boolean
  wordId?: string
}

export interface Piece {
  blocks: Block[]
  row: number
  col: number
  color: string
  shape?: string
}

export interface WordData {
  id: string
  word: string
  definition: string
}

export interface CompletedWord {
  word: string
  positions: { row: number; col: number }[]
  direction: [number, number]
  timestamp: number
}

export interface GameState {
  board: (BoardCell | null)[][]
  currentPiece: Piece | null
  nextPiece: Piece | null
  score: number
  level: number
  lines: number
  gameOver: boolean
  targetWord: WordData
  wordsCompleted: number
  streak: number
  learnedWords: WordData[]
  completedWords: CompletedWord[]
  showWordAnimation: boolean
}
