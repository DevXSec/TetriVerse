const EventEmitter = require("events");
const Piece = require("../piece/Piece");
const { EMPTY_CELL, COLS, ROWS, BLOCKED_CELL } = require("../../utils/constant");

const pieceInstance = new Piece('I');

class Tetris extends EventEmitter {
    constructor(pieceList, roomId, gameMode) {
        super();
        this.score = 0;
        this.pieceIndex = 0;
        this.roomId = roomId;
        this.oldPiece = null;
        this.gameOver = false;
        this.nextPiece = null;
        this.blockedLines = 0;
        this.currentPiece = null;
        this.gameMode = gameMode;
        this.pieceList = pieceList;
        this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY_CELL));
        this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY_CELL));
    }

    startGame() {
        this.currentPiece = this.selectNextPiece();
        this.updateGrid();
    }

    setGameOver() {
        this.gameOver = true;
    }

    selectNextPiece() {
        let newPiece;
        if (this.nextPiece !== null) {
            newPiece = this.nextPiece;
        } else {
            newPiece = pieceInstance.generatePiece(this.pieceList[this.pieceIndex++]);
        }
        this.nextPiece = pieceInstance.generatePiece(this.pieceList[this.pieceIndex++]);

        return newPiece;
    }

    movePiece(dx, dy) {
        if (this.gameOver) return;
        this.clearPieceFromGrid();
        const newX = this.currentPiece.position.x + dx
        const newY = this.currentPiece.position.y + dy;

        if (this.checkMovement(this.currentPiece, newX, newY)) {
            this.currentPiece.position.x = newX;
            this.currentPiece.position.y = newY;
        } else if (dy === 1) {
            this.fixPiece();
            const newPiece = this.selectNextPiece();
            if (!this.checkMovement(newPiece, newPiece.position.x, newPiece.position.y)) {
                this.gameOver = true;
                this.emit("gameOver");
                return;
            }
            this.currentPiece = newPiece;
        }
        this.updateGrid();
    }

    hardDown(dx = 0, dy = 1) {
        if (this.gameOver) return;
        const dropPiece = this.currentPiece;
        while (dropPiece === this.currentPiece && !this.gameOver)
            this.movePiece(dx, dy);
    }

    updateGrid() {
        this.grid = this.board.map(row => [...row]);
        this.currentPiece.shape.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell !== EMPTY_CELL) {
                    const x = this.currentPiece.position.x + j;
                    const y = this.currentPiece.position.y + i;
                    if (y >= 0 && y < ROWS - this.blockedLines && x >= 0 && x < COLS) {
                        if (this.gameMode === 0) { this.grid[y][x] = this.currentPiece.color; }
                        if (this.gameMode === 1) { this.grid[y][x] = "black"; }
                    }
                }
            });
        });
    }

    clearPieceFromGrid() {
        this.grid = this.board.map(row => [...row]);
    }

    rotateMatrix(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
    }

    rotatePiece() {
        if (this.gameOver) return;
    
        const rotatedShape = this.rotateMatrix(this.currentPiece.shape);
        const rotatedPiece = { 
            ...this.currentPiece, 
            shape: rotatedShape 
        };
    
        const minX = this.currentPiece.position.x;
        const maxX = this.currentPiece.position.x + rotatedShape[0].length;
    
        if (minX < 0 || maxX > COLS) {
            return;
        }
    
        if (this.checkMovement(rotatedPiece, this.currentPiece.position.x, this.currentPiece.position.y)) {
            this.currentPiece.shape = rotatedShape;
            this.updateGrid();
        }
    }
    
    clearRow() {
        const playableArea = this.board.slice(0, ROWS - this.blockedLines);
        const newPlayableArea = playableArea.filter(row => row.includes(EMPTY_CELL));
        const clearedLines = playableArea.length - newPlayableArea.length;
        if (clearedLines > 0) {
            this.score += clearedLines * 100;
            this.emit("lineCleared", clearedLines);
        }

        while (newPlayableArea.length < playableArea.length) {
            newPlayableArea.unshift(Array(COLS).fill(EMPTY_CELL));
        }
        const blockedArea = this.board.slice(ROWS - this.blockedLines);
        this.board = newPlayableArea.concat(blockedArea);
    }
    
    fixPiece() {
        this.currentPiece.shape.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell !== EMPTY_CELL) {
                    const x = this.currentPiece.position.x + j;
                    const y = this.currentPiece.position.y + i;
                    if (y >= 0 && y < ROWS - this.blockedLines && x >= 0 && x < COLS) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            });
        });
        this.grid = this.board.map(row => [...row]);
        this.clearRow();
    }

    checkMovement(piece, newX, newY) {
        return piece.shape.every((row, rowIndex) =>
            row.every((cell, colIndex) => {
            if (cell === EMPTY_CELL) return true;
            const x = newX + colIndex;
            const y = newY + rowIndex;
            if (x < 0 || x >= COLS || y >= ROWS - this.blockedLines) return false;
            if (y >= 0 && this.board[y][x] !== EMPTY_CELL) return false;
            return true;
            })
        );
    }

    blockLines(lines) {
        this.blockedLines += lines;
        const indexBlockedLines = 20 - this.blockedLines;
        if (this.blockedLines >= 19) {
            this.gameOver = true;
            this.emit("gameOver");
            return;
        }
        let newBoard = this.board.filter(row => row.includes(EMPTY_CELL) || row.every(cell => cell === BLOCKED_CELL));
        for (let j = indexBlockedLines; j < ROWS; j++) {
            for (let i = 0; i < COLS; i++){
                newBoard[j][i] = BLOCKED_CELL;
            }
        }
        this.board = newBoard;
        this.updateGrid();
    }
}

module.exports = Tetris;

// npm test -- --coverage test/classes/tetris/Tetris.test.jsx