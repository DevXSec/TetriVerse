import React from "react";
import { render, screen } from "@testing-library/react";
import GameSoloView from "../../../src/views/GameSolo/GameSoloView";
import "@testing-library/jest-dom";

describe("GameSoloView", () => {
  const grid = [
    ['red', 0],
    [0, 'blue']
  ];
  
  const nextPiece = {
    shape: [
      [1, 0],
      [0, 1]
    ],
    color: "green"
  };

  const score = 200;

  test("affiche le score correctement", () => {
    render(
      <GameSoloView grid={grid} score={score} nextPiece={nextPiece} gameOver={false} />
    );
    expect(screen.getByText(`Score: ${score}`)).toBeInTheDocument();
  });

  test("affiche le message 'Game Over' quand gameOver est true", () => {
    render(
      <GameSoloView grid={grid} score={score} nextPiece={nextPiece} gameOver={true} />
    );
    const gameOverElement = screen.getByText("Game Over");
    expect(gameOverElement).toBeInTheDocument();
    expect(gameOverElement).toHaveClass("game-over");
  });

  test("affiche la grille avec les bonnes couleurs pour chaque cellule", () => {
    const { container } = render(
      <GameSoloView grid={grid} score={score} nextPiece={nextPiece} gameOver={false} />
    );
    const cellElements = container.querySelectorAll(".cell");
    expect(cellElements).toHaveLength(4);
    expect(cellElements[0]).toHaveStyle({ backgroundColor: "red" });
    expect(cellElements[1]).toHaveStyle({ backgroundColor: "black" }); // 0 → black
    expect(cellElements[2]).toHaveStyle({ backgroundColor: "black" });
    expect(cellElements[3]).toHaveStyle({ backgroundColor: "blue" });
  });

  test("affiche le 'Next Piece' avec les bonnes couleurs pour chaque cellule", () => {
    const { container } = render(
      <GameSoloView grid={grid} score={score} nextPiece={nextPiece} gameOver={false} />
    );
    expect(screen.getByText("Next Piece")).toBeInTheDocument();
    const nextPieceCells = container.querySelectorAll(".next-piece-cell");

    expect(nextPieceCells).toHaveLength(4);
    expect(nextPieceCells[0]).toHaveStyle({ backgroundColor: "green" });
    expect(nextPieceCells[1]).toHaveStyle({ backgroundColor: "transparent" });
    expect(nextPieceCells[2]).toHaveStyle({ backgroundColor: "transparent" });
    expect(nextPieceCells[3]).toHaveStyle({ backgroundColor: "green" });
  });
});
