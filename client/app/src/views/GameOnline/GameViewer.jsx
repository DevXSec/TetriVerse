import React, { useEffect, useState } from "react";
import { EMPTY_CELL } from "../../models/Constants";
import SocketService from '../../services/SocketService';

const GameViewer = ({ grid, nextPiece, local, isLeftPlayer }) => {
  const [board, setBoard] = useState(grid);
  const [piece, setPiece] = useState(nextPiece);

  useEffect(() => {
    setBoard(grid.map(row => [...row]));
    setPiece(nextPiece);
  }, [grid, nextPiece]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!local) return;
      event.preventDefault();
      switch (event.key) {
        case "ArrowLeft":
          SocketService.sendMove('left')
          break;
        case "ArrowRight":
          SocketService.sendMove('right')
          break;
        case "ArrowDown":
          SocketService.sendMove('down')
          break;
        case "ArrowUp":
          SocketService.sendMove('rotate')
          break;
        case " ":
          SocketService.sendMove('hardDown')
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [local]);

  return (
    <div className={`game-container ${!isLeftPlayer ? "left-player" : "right-player"}`}>
      <div className="next-piece-container">
        <h3>Next Piece</h3>
        <div className="next-piece">
          {piece.shape &&
            piece.shape.map((row, rowIndex) => (
              <div key={rowIndex} className="next-piece-row">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className="next-piece-cell"
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: cell !== 0 ? piece.color : "transparent",
                      border: "1px solid #333"
                    }}
                  ></div>
                ))}
              </div>
            ))}
        </div>
      </div>
      <div className="remote-game">
        <div className="grid">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className="cell"
                  style={{ backgroundColor: cell !== EMPTY_CELL ? cell : "black" }}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameViewer;

// npm test -- --coverage test/views/GameOnline/GameViewer.test.jsx --env=jsdom
