const Player = require('./Player');

class PlayerManager {
  constructor() {
    this.players = [];
  }

  addPlayer(userId, socketId, username) {
    this.players.push(new Player(userId, socketId, username));
    console.log(`Joueur ajouté: ${userId} ${username} (${socketId})`);
  }

  updatePlayerSocket(userId, socketId) {
    const player = this.players.find(player => player.userId === userId);
    if (player) {
      player.socketId = socketId;
    }
  }

  updatePlayerName(userId, username) {
    const player = this.players.find(player => player.userId === userId);
    if (player) {
      player.name = username;
    }
  }

  updatePlayerInfos(userId, socketId) {
    const player = this.players.find(player => player.userId === userId);
    if (player) {
      player.socketId = socketId;
    }
    const otherPlayer = this.players.find(player => player.socketId === socketId);
    if (otherPlayer) {
      otherPlayer.userId = userId;
    }
  }

  removePlayer(userId) {
    if (this.players.some((p) => p.userId === userId)) {
      const newplayers = this.players.filter((p) => p.userId !== userId);
      return newplayers;
    }
  }

  getPlayer(socketId) {
    return this.players.find((p) => p.socketId === socketId);
  }

  getAllPlayers() {
    return this.players;
  }

  getPlayerById(userId) {
    return this.players.find((p) => p.userId === userId);
  }

  getLeaderboard() {
    const leaderboard = [];
    this.players.forEach((player) => {
      if (player.bestScore !== null) {
        leaderboard.push(player)
      }
    });
    leaderboard.sort((a, b) => b.bestScore - a.bestScore);
    return leaderboard;
  }
}

module.exports = PlayerManager;

// npm test -- --coverage test/classes/player/PlayerManager.test.jsx