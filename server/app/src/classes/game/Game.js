const ended = "Ended";
const wait = "Waiting";
const started = "Started";
const EventEmitter = require("events");
const Piece = require('../piece/Piece');
const Tetris = require('../tetris/Tetris');

const pieceInstance = new Piece('I');

class Game extends EventEmitter {
    constructor(roomId, player) {
        super();
        this.viewers = [];
        this.gameMode = 0;
        this.status = wait;
        this.player2 = null;
        this.roomId = roomId;
        this.interval = null;
        this.player1 = player;
        this.pieceList = pieceInstance.generatePieceList(200);
        this.tetris1 = new Tetris(this.pieceList, this.roomId, this.gameMode);
        this.tetris2 = new Tetris(this.pieceList, this.roomId, this.gameMode);
    }
  
    addPlayer(player) {
        if (this.player2 === null && this.status !== started) {
            this.player2 = player;
        } else {
            this.viewers.push(player);
        }
    }

    handleGameOver(player) {
        this.endGame();
        this.emit("gameOver", { roomId: this.roomId, winner: player });
    }

    handleLineClear(tetrisId, lines) {
        let opponent;
        if (tetrisId === 1) {
            opponent = this.tetris2;
        } else {
            opponent = this.tetris1;
        }
        opponent.blockLines(lines);
    }

    isFull() {
        return (this.player2 !== null)
    }

    getTetris(player) {
        if (this.player1 === player) {
            return this.tetris1;
        }
        return this.tetris2;
    }

    startGame(mode) {
        this.gameMode = mode;
        this.tetris1.gameMode = mode;
        this.tetris2.gameMode = mode;
        this.status = started;
        this.tetris1.startGame();
        this.tetris2.startGame();

        this.tetris1.on("gameOver", () => this.handleGameOver(this.player2));
        this.tetris2.on("gameOver", () => this.handleGameOver(this.player1));

        this.tetris1.on("lineCleared", (lines) => this.handleLineClear(1, lines));
        this.tetris2.on("lineCleared", (lines) => this.handleLineClear(2, lines));

        this.interval = setInterval(() => {
            if (this.status !== ended) {
              this.applyGravity();
              this.emit("gameState");
            }
        }, 500);
        this.emit("gameState");
    }

    endGame() {
        this.status = ended;
        clearInterval(this.interval)
        if (this.tetris1) {
            this.tetris1.setGameOver();
        }
        if (this.tetris2) {
            this.tetris2.setGameOver();
        }
    }
  
    applyGravity() {
        this.tetris1.movePiece(0, 1);
        this.tetris2.movePiece(0, 1);
    }

    getPlayerByUuid(uuid) {
        if (this.player1 && this.player1.getUserId() === uuid) {
            return this.player1;
        }
        if (this.player2 && this.player2.getUserId() === uuid) {
            return this.player2
        }
        return null;
    }

    clearGame() {
        this.pieceList = pieceInstance.generatePieceList(200);
        this.tetris1 = new Tetris(this.pieceList, this.roomId, this.gameMode);
        this.tetris2 = new Tetris(this.pieceList, this.roomId, this.gameMode);
    }

    updatePlayers(leaver) {
        if (this.player1.userId === leaver.userId) {
            leaver = this.player1.name;
            if (this.status === started) {
                this.endGame();
                this.emit("gameOver", { winner: this.player2 });
            }
            if (this.player2 !== null) {
                this.player1 = this.player2;
                this.player2 = null;
                if (this.viewers.length > 0) {
                    this.player2 = this.viewers.shift();
                }
            } else if (this.player2 === null && this.viewers.length > 0) {
                this.player1 = this.viewers.shift();
            } else {
                return this.emit("deleteGame");
            }
        } else if (this.player2.userId === leaver.userId) {
            leaver = this.player2.name;
            this.endGame();
            this.emit("gameOver", { winner: this.player1 });
            this.player2 = null;
            if (this.viewers.length > 0) {
                this.player2 = this.viewers.shift();
            }
        } else if (this.viewers.find(viewer => viewer.userId === leaver.userId)) {
            const viewer = this.viewers.find(viewer => viewer.userId === leaver.userId);
            const index = this.viewers.indexOf(viewer);
            if (index !== -1) {
                this.viewers.splice(index, 1);
            }
        }
        this.emit("updateInfosGame", (leaver));
    }

    updateViewers() {
        if (this.player2 === null && this.viewers.length > 0) {
            this.player2 = this.viewers.shift();
        }
    }
    
    getGameMode() 
    {
        return this.gameMode;
    }
}

module.exports = Game;

// npm test -- --coverage test/classes/game/Game.test.jsx
