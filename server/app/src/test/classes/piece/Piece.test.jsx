const Piece = require('../../../classes/piece/Piece');

describe('Piece', () => {
  describe('Constructor', () => {
    test('doit initialiser correctement une pièce de type "I"', () => {
      const piece = new Piece('I');
      expect(piece.type).toBe('I');
      const info = piece.getInfos('I');
      expect(piece.shape).toEqual(info.shape);
      expect(piece.color).toEqual(info.color);
      expect(piece.currentRotation).toBe(0);
      expect(piece.position).toEqual({ x: 3, y: -1 });
    });
  });

  describe('getInfos', () => {
    test('doit retourner les bonnes informations pour la pièce de type "T"', () => {
      const piece = new Piece('T');
      const info = piece.getInfos('T');
      expect(info.shape).toEqual([
        [0, 'T', 0],
        ['T', 'T', 'T'],
      ]);
      expect(info.color).toBe('#800080');
    });

    test('doit retourner les bonnes informations pour la pièce de type "O"', () => {
      const piece = new Piece('O');
      const info = piece.getInfos('O');
      expect(info.shape).toEqual([
        ['O', 'O'],
        ['O', 'O'],
      ]);
      expect(info.color).toBe('#FFD700');
    });
  });

  describe('getRandomPiece', () => {
    test('doit retourner une nouvelle instance de Piece avec un type valide', () => {
      const piece = new Piece('I');
      const randomPiece = piece.getRandomPiece();
      expect(randomPiece).toBeInstanceOf(Piece);
      // On vérifie que le type retourné est bien l'une des lettres autorisées
      expect("IJLOSTZ").toContain(randomPiece.type);
    });
  });

  describe('generatePiece', () => {
    test('doit retourner une nouvelle instance de Piece avec le type fourni', () => {
      const piece = new Piece('I');
      const newPiece = piece.generatePiece('L');
      expect(newPiece).toBeInstanceOf(Piece);
      expect(newPiece.type).toBe('L');
      const info = newPiece.getInfos('L');
      expect(newPiece.shape).toEqual(info.shape);
      expect(newPiece.color).toEqual(info.color);
    });
  });

  describe('generatePieceList', () => {
    test('doit générer une liste de count pièces aléatoires (lettres)', () => {
      const piece = new Piece('I');
      const count = 15;
      const list = piece.generatePieceList(count);
      expect(Array.isArray(list)).toBe(true);
      expect(list).toHaveLength(count);
      list.forEach(letter => {
        expect("IJLOSTZ").toContain(letter);
      });
    });

    test('doit générer une liste d\'une pièce par défaut si count n\'est pas fourni', () => {
      const piece = new Piece('I');
      const list = piece.generatePieceList();
      expect(Array.isArray(list)).toBe(true);
      expect(list).toHaveLength(1);
      expect("IJLOSTZ").toContain(list[0]);
    });
  });
});
