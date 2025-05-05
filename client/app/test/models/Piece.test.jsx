// Piece.test.js
import randomPiece, { PIECE } from "../../src/models/Piece";

describe("Module Piece", () => {
  test("PIECE doit contenir les clés I, J, L, O, S, T, Z", () => {
    const keys = Object.keys(PIECE);
    expect(keys.sort()).toEqual(["I", "J", "L", "O", "S", "T", "Z"].sort());
  });

  test("randomPiece doit retourner une pièce parmi celles définies dans PIECE", () => {
    const piece = randomPiece();
    // On vérifie que la pièce retournée correspond à l'une des valeurs de PIECE
    const possiblePieces = Object.values(PIECE);
    expect(possiblePieces).toContainEqual(piece);
  });

  test("randomPiece retourne des pièces aléatoires", () => {
    // On appelle randomPiece plusieurs fois et on vérifie qu'au moins 2 types différents sont retournés
    const foundKeys = new Set();
    for (let i = 0; i < 100; i++) {
      const piece = randomPiece();
      // On compare la pièce retournée aux définitions dans PIECE pour déterminer la clé correspondante
      for (const [key, value] of Object.entries(PIECE)) {
        // Comparaison simple via JSON.stringify (suffisante pour ce test)
        if (JSON.stringify(piece) === JSON.stringify(value)) {
          foundKeys.add(key);
        }
      }
    }
    // On attend au moins 2 types différents
    expect(foundKeys.size).toBeGreaterThanOrEqual(2);
  });
});
