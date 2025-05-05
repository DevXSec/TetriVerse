const { EMPTY_CELL, BLOCKED_CELL, COLS, ROWS } = require('../../../utils/constant');
const Tetris = require('../../../classes/tetris/Tetris');

jest.mock('../../../utils/constant', () => ({
    EMPTY_CELL: 0,
    BLOCKED_CELL: 'X',
    COLS: 10,
    ROWS: 20,
  }));
  
jest.mock('../../../classes/piece/Piece', () => {
return jest.fn().mockImplementation(() => {
    return {
    generatePiece: jest.fn((type) => {
        return {
        type: type,
        position: { x: 3, y: -1 },
        shape: [[type]],
        color: "#000000",
        };
    }),
    };
});
});
  
  
describe("Tetris", () => {
    let tetris;
    const pieceList = ["I", "O", "T", "L", "J"];
  
    beforeEach(() => {
      tetris = new Tetris(pieceList, "room-test", 1);
    });
  
    test("Le constructeur doit initialiser grid et board correctement", () => {
      expect(tetris.score).toBe(0);
      expect(tetris.pieceIndex).toBe(0);
      expect(tetris.roomId).toBe("room-test");
      expect(tetris.gameOver).toBe(false);
      expect(tetris.grid.length).toBe(ROWS);
      tetris.grid.forEach(row => {
        expect(row.length).toBe(COLS);
        row.forEach(cell => expect(cell).toBe(EMPTY_CELL));
      });
    });
  
    test("startGame doit définir currentPiece et mettre à jour la grid", () => {
      tetris.startGame();
      expect(tetris.currentPiece).toBeDefined();
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          expect(tetris.grid[y][x]).toBe(EMPTY_CELL);
        }
      }
    });
  
    test("setGameOver doit passer gameOver à true", () => {
      tetris.setGameOver();
      expect(tetris.gameOver).toBe(true);
    });
  
    test("selectNextPiece doit retourner la pièce suivante et mettre à jour nextPiece", () => {
      const piece1 = tetris.selectNextPiece();
      expect(piece1.type).toBe("I");
      expect(tetris.nextPiece.type).toBe("O");
    });
  
    test("movePiece doit mettre à jour la position de currentPiece quand le déplacement est autorisé", () => {
      tetris.startGame();
      const initialX = tetris.currentPiece.position.x;
      const initialY = tetris.currentPiece.position.y;
      tetris.movePiece(0, 1);
      expect(tetris.currentPiece.position.x).toBe(initialX);
      expect(tetris.currentPiece.position.y).toBe(initialY + 1);
    });
  
    test("movePiece doit fixer la pièce et sélectionner une nouvelle pièce en cas de collision", () => {
      tetris.startGame();
      tetris.checkMovement = jest.fn(() => false);
      const gameOverListener = jest.fn();
      tetris.on("gameOver", gameOverListener);
      tetris.movePiece(0, 1);
      expect(tetris.gameOver).toBe(true);
      expect(gameOverListener).toHaveBeenCalled();
    });
  
    test("hardDown doit déplacer la pièce jusqu'à fixation", () => {
      tetris.startGame();
      let callCount = 0;
      tetris.checkMovement = jest.fn(() => {
        callCount++;
        return callCount <= 3;
      });
      const fixPieceSpy = jest.spyOn(tetris, "fixPiece");
      tetris.hardDown();
      expect(fixPieceSpy).toHaveBeenCalled();
    });
  
    test("rotateMatrix doit correctement pivoter une matrice", () => {
      const matrix = [
        [1, 2],
        [3, 4]
      ];
      const rotated = tetris.rotateMatrix(matrix);
      expect(rotated).toEqual([
        [3, 1],
        [4, 2]
      ]);
    });
  
    test("rotatePiece doit pivoter currentPiece si le mouvement est autorisé", () => {
      tetris.startGame();
      tetris.currentPiece.shape = [
        [1, 2],
        [3, 4]
      ];
      tetris.checkMovement = jest.fn(() => true);
      tetris.rotatePiece();
      expect(tetris.currentPiece.shape).toEqual([
        [3, 1],
        [4, 2]
      ]);
    });
  
    test("clearRow doit supprimer les lignes complètes, augmenter le score et émettre l'événement lineCleared", () => {
      tetris.board[10] = Array(COLS).fill("filled");
      const lineClearedListener = jest.fn();
      tetris.on("lineCleared", lineClearedListener);
      tetris.clearRow();
      expect(tetris.score).toBe(100);
      expect(lineClearedListener).toHaveBeenCalledWith(1);
      expect(tetris.board[0]).toEqual(Array(COLS).fill(EMPTY_CELL));
    });
  
    test("fixPiece doit copier currentPiece dans le board et appeler clearRow", () => {
      tetris.startGame();
      tetris.currentPiece.shape = [[tetris.currentPiece.type]];
      tetris.currentPiece.position = { x: 5, y: 5 };
      const clearRowSpy = jest.spyOn(tetris, "clearRow");
      tetris.fixPiece();
      expect(tetris.board[5][5]).toBe(tetris.currentPiece.color);
      expect(clearRowSpy).toHaveBeenCalled();
    });
  
    test("checkMovement doit retourner false si le déplacement sort des limites", () => {
      tetris.startGame();
      let allowed = tetris.checkMovement(tetris.currentPiece, -1, tetris.currentPiece.position.y);
      expect(allowed).toBe(false);
      allowed = tetris.checkMovement(tetris.currentPiece, COLS, tetris.currentPiece.position.y);
      expect(allowed).toBe(false);
      allowed = tetris.checkMovement(tetris.currentPiece, tetris.currentPiece.position.x, ROWS);
      expect(allowed).toBe(false);
    });
  
    test("blockLines doit mettre à jour blockedLines, modifier le board et émettre gameOver si trop de lignes sont bloquées", () => {
      tetris.startGame();
      const gameOverListener = jest.fn();
      tetris.on("gameOver", gameOverListener);
      tetris.blockLines(2);
      expect(tetris.blockedLines).toBe(2);
      const indexBlockedLines = ROWS - tetris.blockedLines;
      for (let j = indexBlockedLines; j < ROWS; j++) {
        for (let i = 0; i < COLS; i++){
          expect(tetris.board[j][i]).toBe(BLOCKED_CELL);
        }
      }
      expect(tetris.blockedLines).toBe(2);
      expect(tetris.gameOver).toBe(false);
    });
});
  