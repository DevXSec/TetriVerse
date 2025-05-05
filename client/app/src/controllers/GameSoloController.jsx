import { canMove, clearFullRows } from "../models/GameSoloModel";
import randomPiece from "../models/Piece";

export function movePiece(board, piece, dx, dy) {
  const newX = piece.x + dx;
  const newY = piece.y + dy;
  if (!canMove(board, piece, newX, newY)) {
    return null;
  }
  return { ...piece, x: newX, y: newY };
}

export function fixPiece(board, piece) {
  const newBoard = board.map(row => row.slice());
  piece.shape.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== 0) {
        let x = piece.x + colIndex;
        let y = piece.y + rowIndex;
        if (y < 0) y = 0;
        newBoard[y][x] = piece.color;
      }
    });
  });
  const { board: updatedBoard, clearedRowsCount } = clearFullRows(newBoard);
  return { updatedBoard, clearedRowsCount };
}

export function getNewPiece(nextPiece) {
  return {
    currentPiece: nextPiece,
    nextPiece: randomPiece()
  };
}

// npm test -- --coverage test/controllers/GameSoloController.test.jsx --env=jsdom
