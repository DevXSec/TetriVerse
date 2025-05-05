// GameSoloModel.test.js
import { ROWS,COLS, EMPTY_CELL } from "../../src/models/Constants";
import {
    createEmptyBoard,
    clearFullRows,
    canMove,
    rotateMatrix,
    drawPiece
  } from "../../src/models/GameSoloModel";
  
  describe("Constantes et fonctions du modèle de jeu solo", () => {
    describe("Constantes", () => {
      test("ROWS doit être égal à 20", () => {
        expect(ROWS).toBe(20);
      });
      test("COLS doit être égal à 10", () => {
        expect(COLS).toBe(10);
      });
      test("EMPTY_CELL doit être égal à 0", () => {
        expect(EMPTY_CELL).toBe(0);
      });
    });
  
    describe("createEmptyBoard", () => {
      test("doit créer un plateau vide aux bonnes dimensions", () => {
        const board = createEmptyBoard();
        expect(board.length).toBe(ROWS);
        board.forEach(row => {
          expect(row.length).toBe(COLS);
          row.forEach(cell => {
            expect(cell).toBe(EMPTY_CELL);
          });
        });
      });
    });
  
    describe("clearFullRows", () => {
      test("doit supprimer les lignes complètes et renvoyer le nouveau plateau et le nombre de lignes supprimées", () => {
        const board = createEmptyBoard();
        board[5] = Array(COLS).fill(1);
        const { board: newBoard, clearedRowsCount } = clearFullRows(board);
        expect(clearedRowsCount).toBe(1);
        expect(newBoard.length).toBe(ROWS);
        for (let i = 0; i < clearedRowsCount; i++) {
          newBoard[i].forEach(cell => expect(cell).toBe(EMPTY_CELL));
        }

        const hasFullRow = newBoard.some(row => row.every(cell => cell !== EMPTY_CELL));
        expect(hasFullRow).toBe(false);
      });
    });

  
    describe("canMove", () => {
      test("doit retourner true si le déplacement est possible", () => {
        const board = createEmptyBoard();
        const piece = { x: 4, y: 0, color: "red", shape: [[1]] };
        const result = canMove(board, piece, piece.x + 1, piece.y + 1);
        expect(result).toBe(true);
      });
  
      test("doit retourner true si la piece ne touche pas les bords", () => {
        const board = createEmptyBoard();
        const piece = { x: 0, y: 0, color: "red", shape: [[0]] };
        const result = canMove(board, piece, piece.x + 1, piece.y);
        expect(result).toBe(true);
      });
  
      test("doit retourner false si la pièce n'ai plus dans la grille", () => {
        const board = createEmptyBoard();
        const piece = { x: -1, y: 4, color: "blue", shape: [[1]] };
        const result = canMove(board, piece, piece.x, 20);
        expect(result).toBe(false);
      });
    });
  
    describe("rotateMatrix", () => {
      test("doit retourner la matrice correctement pivotée", () => {
        const matrix = [
          [1, 2, 3],
          [4, 5, 6]
        ];
        const rotated = rotateMatrix(matrix);
        expect(rotated).toEqual([
          [4, 1],
          [5, 2],
          [6, 3]
        ]);
      });
    });
  
    describe("drawPiece", () => {
      test("doit dessiner la pièce sur le plateau", () => {
        const board = createEmptyBoard();
        const piece = {
          x: 3,
          y: 4,
          color: "green",
          shape: [
            [1, 1],
            [0, 1]
          ]
        };
        const newBoard = drawPiece(board, piece);
        expect(board).not.toEqual(newBoard);
        expect(newBoard[4][3]).toBe("green");
        expect(newBoard[4][4]).toBe("green");
        expect(newBoard[5][4]).toBe("green");
        expect(newBoard[4][5]).toBe(EMPTY_CELL);
      });
    });
  });
  