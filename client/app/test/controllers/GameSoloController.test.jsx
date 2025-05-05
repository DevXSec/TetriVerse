// GameSoloFunctions.test.js
import { movePiece, fixPiece, getNewPiece } from "../../src/controllers/GameSoloController";
import { canMove, clearFullRows } from "../../src/models/GameSoloModel";
import randomPiece from "../../src//models/Piece";

// On mocke les fonctions canMove et clearFullRows depuis GameSoloModel
jest.mock("../../src/models/GameSoloModel", () => ({
  canMove: jest.fn(),
  clearFullRows: jest.fn(),
}));

// On mocke randomPiece depuis Piece
jest.mock("../../src/models/Piece", () => jest.fn());

describe("movePiece", () => {
  const board = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const piece = { x: 1, y: 1, color: "red", shape: [[1]] };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("devrait déplacer la pièce si canMove retourne true", () => {
    // Simule que le déplacement est possible
    canMove.mockReturnValue(true);
    const result = movePiece(board, piece, 1, 0);
    expect(result).toEqual({ ...piece, x: piece.x + 1, y: piece.y });
    expect(canMove).toHaveBeenCalledWith(board, piece, piece.x + 1, piece.y);
  });

  it("devrait retourner null si le déplacement n'est pas possible", () => {
    canMove.mockReturnValue(false);
    const result = movePiece(board, piece, 1, 1);
    expect(result).toBeNull();
  });
});

describe("fixPiece", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("devrait fixer la pièce sur le plateau et appeler clearFullRows", () => {
    const board = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    // Une pièce simple avec une forme 2x2
    const piece = { x: 0, y: 0, color: "blue", shape: [[1, 1], [0, 1]] };
    // On simule clearFullRows pour qu'elle retourne le board inchangé et 0 lignes supprimées
    clearFullRows.mockReturnValue({ board: board, clearedRowsCount: 0 });
    const { updatedBoard, clearedRowsCount } = fixPiece(board, piece);

    expect(updatedBoard[0][0]).toBe(0);
    expect(updatedBoard[0][1]).toBe(0);
    expect(updatedBoard[1][1]).toBe(0);
    expect(clearedRowsCount).toBe(0);
    expect(clearFullRows).toHaveBeenCalled();
  });
});

describe("getNewPiece", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("devrait retourner un objet avec currentPiece et un nouveau nextPiece", () => {
    const nextPiece = { x: 0, y: 0, color: "green", shape: [[1]] };
    // On simule randomPiece pour qu'elle retourne une pièce prédéfinie
    randomPiece.mockReturnValue({ x: 5, y: 5, color: "yellow", shape: [[1]] });
    const result = getNewPiece(nextPiece);

    expect(result).toEqual({
      currentPiece: nextPiece,
      nextPiece: { x: 5, y: 5, color: "yellow", shape: [[1]] },
    });
    expect(randomPiece).toHaveBeenCalled();
  });
});
