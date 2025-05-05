const Game = require('./Game');

class GameManager {
  constructor() {
    this.games = [];
  }

  createGame(player) {
    const roomId = `room-${Math.random().toString(36)}`;
    const newGame = new Game(roomId, player);
    this.games.push(newGame);
    return newGame;
  }

  joinGame(player, roomId) {
    const game = this.games.find(game => game.roomId === roomId);
    if (game) {
      game.addPlayer(player);
    }
    return game;
  }

  checkGamesForPlayer(player) {
    const gameAsPlayer = this.games.find(game => (game.player1 && game.player1.userId === player.userId || (game.player2 && game.player2.userId === player.userId)));
    const gameAsViewer = this.games.find(game => game.viewers.find(viewer => viewer.userId === player.userId));
    if (gameAsPlayer || gameAsViewer) {
      return true;
    }
    return false;
  }

  getRandomGame() {
    return this.games.find(game => game.status !== "Started" && !game.isFull());
  }

  getGame(roomId) {
    const game = this.games.find(game => game.roomId === roomId);
    return game;
  }

  getTetris(game, player) {
    if (game.player1.userId === player.userId) {
      return game.tetris1;
    }
    return game.tetris2;
  }

  returningPlayer(player, game) {
    if ((game.player1 && game.player1.userId === player.userId) || (game.player2 && game.player2.userId === player.userId) || game.viewers.find(v => v.userId === player.userId)) {
      return true;
    }
    return false;
  }

  updatePlayerSocket(returningPlayer, roomId) {
    const game = this.getGame(roomId);
    if (game) {
      let player;
      if (game.player1.userId === returningPlayer.userId) {
        player = game.player1;
      } else if (game.player2 && game.player2.userId === returningPlayer.userId) {
        player = game.player2;
      }
      if (player) {
        player.socketId = returningPlayer.socketId;
      }
    }
  }

  deleteGame(roomId) {
    const game = this.getGame(roomId);
    if (game) {
      const index = this.games.indexOf(game);
      if (index !== -1) {
        this.games.splice(index, 1);
      }
    }
  }
}

module.exports = GameManager;

// npm test -- --coverage test/classes/game/GameManager.test.jsx