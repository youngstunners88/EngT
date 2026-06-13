// Standard Tetris piece shapes with their block positions
export const PIECE_SHAPES = {
  I: [
    { row: 0, col: 0, letter: "" },
    { row: 0, col: 1, letter: "" },
    { row: 0, col: 2, letter: "" },
    { row: 0, col: 3, letter: "" },
  ],
  O: [
    { row: 0, col: 0, letter: "" },
    { row: 0, col: 1, letter: "" },
    { row: 1, col: 0, letter: "" },
    { row: 1, col: 1, letter: "" },
  ],
  T: [
    { row: 0, col: 1, letter: "" },
    { row: 1, col: 0, letter: "" },
    { row: 1, col: 1, letter: "" },
    { row: 1, col: 2, letter: "" },
  ],
  S: [
    { row: 0, col: 1, letter: "" },
    { row: 0, col: 2, letter: "" },
    { row: 1, col: 0, letter: "" },
    { row: 1, col: 1, letter: "" },
  ],
  Z: [
    { row: 0, col: 0, letter: "" },
    { row: 0, col: 1, letter: "" },
    { row: 1, col: 1, letter: "" },
    { row: 1, col: 2, letter: "" },
  ],
  J: [
    { row: 0, col: 0, letter: "" },
    { row: 1, col: 0, letter: "" },
    { row: 1, col: 1, letter: "" },
    { row: 1, col: 2, letter: "" },
  ],
  L: [
    { row: 0, col: 2, letter: "" },
    { row: 1, col: 0, letter: "" },
    { row: 1, col: 1, letter: "" },
    { row: 1, col: 2, letter: "" },
  ],
}

export const TETRIS_PIECES = [
  {
    shape: "I",
    blocks: PIECE_SHAPES.I,
    row: 0,
    col: 3,
    color: "bg-cyan-500",
  },
  {
    shape: "O",
    blocks: PIECE_SHAPES.O,
    row: 0,
    col: 4,
    color: "bg-yellow-500",
  },
  {
    shape: "T",
    blocks: PIECE_SHAPES.T,
    row: 0,
    col: 3,
    color: "bg-purple-500",
  },
  {
    shape: "S",
    blocks: PIECE_SHAPES.S,
    row: 0,
    col: 3,
    color: "bg-green-500",
  },
  {
    shape: "Z",
    blocks: PIECE_SHAPES.Z,
    row: 0,
    col: 3,
    color: "bg-red-500",
  },
  {
    shape: "J",
    blocks: PIECE_SHAPES.J,
    row: 0,
    col: 3,
    color: "bg-blue-500",
  },
  {
    shape: "L",
    blocks: PIECE_SHAPES.L,
    row: 0,
    col: 3,
    color: "bg-orange-500",
  },
]
