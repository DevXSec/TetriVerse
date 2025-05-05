import { ROWS, COLS, EMPTY_CELL } from "./Constants";

export function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY_CELL));
}

export function clearFullRows(board) {
  const filteredRows = board.filter(row => row.some(cell => cell === EMPTY_CELL));
  const clearedRowsCount = board.length - filteredRows.length;
  const newEmptyRows = Array.from({ length: clearedRowsCount }, () =>
    Array(COLS).fill(EMPTY_CELL)
  );
  return { board: newEmptyRows.concat(filteredRows), clearedRowsCount };
}

export function canMove(board, piece, newX, newY) {
  return piece.shape.every((row, rowIndex) =>
    row.every((cell, colIndex) => {
      if (cell === EMPTY_CELL) return true;
      const x = newX + colIndex;
      const y = newY + rowIndex;
      if (x < 0 || x >= COLS || y >= ROWS) { return false;}
      if (y >= 0 && board[y][x] !== EMPTY_CELL) return false;
      return true;
    })
  );
}

export function rotateMatrix(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

export function drawPiece(board, piece) {
  const newGrid = board.map(row => row.slice());
  piece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== 0) {
        const x = piece.x + colIndex;
        const y = piece.y + rowIndex;
        if (y >= 0) newGrid[y][x] = piece.color;
      }
    });
  });
  return newGrid;
}

// npm test -- --coverage test/models/GameSoloModel.test.jsx --env=jsdom
