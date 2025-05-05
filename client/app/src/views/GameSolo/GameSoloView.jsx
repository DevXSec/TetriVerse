import React from "react";

const GameSoloView = ({ grid, score, nextPiece, gameOver }) => {
  return (
    <div className="tetris-container">
      {gameOver && <div className="game-over">Game Over</div>}
        <div className='solo-view'>
          <div className="score">Score: {score}</div>
          <div className="main-game">
            <div className="grid">
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                  {row.map((cell, colIndex) => (
                    <div
                      key={colIndex}
                      className="cell"
                      style={{ backgroundColor: cell !== 0 ? cell : "black" }}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="next-piece-container">
          <h3>Next Piece</h3>
          <div className="next-piece">
            {nextPiece.shape.map((row, rowIndex) => (
              <div key={rowIndex} className="next-piece-row">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className="next-piece-cell"
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: cell !== 0 ? nextPiece.color : "transparent",
                      border: "1px solid #333"
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default GameSoloView;

// npm test -- --coverage test/views/GameSolo/GameSoloView.test.jsx --env=jsdom