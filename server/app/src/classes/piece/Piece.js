class Piece {
  constructor(type) {
      this.type = type;
      this.shape = this.getInfos(type).shape;
      this.currentRotation = 0;
      this.position = { x: 3, y: -1 };
      this.color = this.getInfos(type).color;
  }

  getRandomPiece() {
      const pieces = "IJLOSTZ";
      const randPiece = pieces[Math.floor(Math.random() * pieces.length)];
      return new Piece(randPiece);
  }

  generatePiece(type) {
    return new Piece(type);
  }

  getInfos(type) {
      const shapes = {
          I: {
              shape: [
                  ["I", "I", "I", "I"],
                  [0, 0, 0, 0],
                  [0, 0, 0, 0],
                  [0, 0, 0, 0],
              ],
              color: "#00FFFF"
          },
          J: {
              shape: [
                  ["J", 0, 0],
                  ["J", "J", "J"],
              ],
              color: "#0000FF"
          },
          L: {
              shape: [
                  [0, 0, "L"],
                  ["L", "L", "L"],
              ],
              color: "#FFA500"
          },
          O: {
              shape: [
                  ["O", "O"],
                  ["O", "O"],
              ],
              color: "#FFD700"
          },
          S: {
              shape: [
                  [0, "S", "S"],
                  ["S", "S", 0],
              ],
              color: "#00FF00"
          },
          T: {
              shape: [
                  [0, "T", 0],
                  ["T", "T", "T"],
              ],
              color: "#800080"
          },
          Z: {
              shape: [
                  ["Z", "Z", 0],
                  [0, "Z", "Z"],
              ],
              color: "#FF0000"
          }
      };
      return shapes[type];
  }

  generatePieceList(count = 1) {
      let pieceList = [];
      const pieces = "IJLOSTZ";
      for (let i = 0; i < count; i++) {
         const randPiece = pieces[Math.floor(Math.random() * pieces.length)];
         pieceList.push(randPiece);
      }
      return pieceList;
  }
}

module.exports = Piece;

// npm test -- --coverage test/classes/piece/Piece.test.jsx
