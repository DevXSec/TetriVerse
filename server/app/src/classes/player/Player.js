class Player {
  constructor(userId, socketId, name) {
    this.userId = userId;
    this.socketId = socketId;
    this.name = name;
    this.bestScore = null;
  }

  getUsername() {
      return this.name;
  }

  getUserId() {
    return this.userId;
  }

  getSocketId() {
    return this.socketId;
  }

  getBestScore() {
    return this.bestScore;
  }

  setUsername(username) {
      this.name = username;
  }

  setBestScore(score) {
    this.bestScore = score;
}
}

module.exports = Player;

// npm test -- --coverage test/classes/player/Player.test.jsx
