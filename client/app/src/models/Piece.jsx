export const PIECE = {
  I: {
    shape: [
      [0, 0, 0, 0],
      ["I", "I", "I", "I"],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    x: 3,
    y: -1,
    color: "#00FFFF"
  },
  J: {
    shape: [
      ["J", 0, 0],
      ["J", "J", "J"],
    ],
    x: 3,
    y: -1,
    color: "#0000FF"
  },
  L: {
    shape: [
      [0, 0, "L"],
      ["L", "L", "L"],
    ],
    x: 3,
    y: -1,
    color: "#FFA500"
  },
  O: {
    shape: [
      ["O", "O"],
      ["O", "O"],
    ],
    x: 4,
    y: -1,
    color: "#FFD700"
  },
  S: {
    shape: [
      [0, "S", "S"],
      ["S", "S", 0],
    ],
    x: 3,
    y: -1,
    color: "#00FF00"
  },
  T: {
    shape: [
      [0, "T", 0],
      ["T", "T", "T"],
    ],
    x: 3,
    y: -1,
    color: "#800080"
  },
  Z: {
    shape: [
      ["Z", "Z", 0],
      [0, "Z", "Z"],
    ],
    x: 3,
    y: -1,
    color: "#FF0000"
  }
};
  
const randomPiece = () => {
  const pieces = "IJLOSTZ";
  const randPiece = pieces[Math.floor(Math.random() * pieces.length)];
  return PIECE[randPiece];
};

export default randomPiece;

// npm test -- --coverage test/models/Piece.test.jsx --env=jsdom
