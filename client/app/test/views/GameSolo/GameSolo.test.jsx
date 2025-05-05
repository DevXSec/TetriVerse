import "@testing-library/jest-dom";
import React, { useState } from "react";
import { MemoryRouter, useNavigate } from 'react-router-dom';
import GameSolo from "../../../src/views/GameSolo/GameSolo";
import GameSoloModel from "../../../src/models/GameSoloModel";
import SocketService from '../../../src/services/SocketService';
import { render, screen, fireEvent, act } from "@testing-library/react";
import GameSoloController from "../../../src/controllers/GameSoloController";

jest.useFakeTimers();

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../src/views/GameSolo/GameSoloView", () => {
  return jest.fn((props) => {
    return (
      <div data-testid="game-solo-view">
        GameSoloView: score: {props.score}
      </div>
    );
  });
});

jest.mock("../../../src/models/Piece", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    shape: [[1]],
    x: 0,
    y: 0,
  })),
}));

jest.mock("../../../src/controllers/GameSoloController", () => ({
  movePiece: jest.fn((board, piece, dx, dy) => {
    if (dy === 1) return null;
    return { ...piece, x: piece.x + dx, y: piece.y + dy };
  }),
  fixPiece: jest.fn((board, piece) => ({
    updatedBoard: board,
    clearedRowsCount: 0,
  })),
  getNewPiece: jest.fn((prevNextPiece) => ({
    currentPiece: { shape: [[1]], x: 0, y: 0 },
    nextPiece: { shape: [[1]], x: 0, y: 0 },
  })),
}));

jest.mock("../../../src/models/GameSoloModel", () => ({
  createEmptyBoard: jest.fn(() => Array(20).fill(Array(10).fill(0))),
  drawPiece: jest.fn((board, piece) => board),
  canMove: jest.fn(() => true),
  rotateMatrix: jest.fn((matrix) => matrix),
}));

const socketOnHandlers = {};

jest.mock("../../../src/services/SocketService", () => ({
  checkUserID: jest.fn(),
  socket: {
    on: jest.fn((event, callback) => {
      socketOnHandlers[event] = callback;
    }),
    off: jest.fn((event) => {
      delete socketOnHandlers[event];
    }),
  },
}));

jest.mock('../../../src/services/SocketService', () => ({
  sendScore: jest.fn(),
}));

const useGameOverHandler = (initialGameOver, initialScore) => {
  const [gameOver, setGameOver] = useState(initialGameOver);
  const [scoreUpdated, setScoreUpdated] = useState(false);
  const [score, setScore] = useState(initialScore);

  const checkGameOver = () => {
    if (gameOver && !scoreUpdated) {
      setScoreUpdated(true);
      SocketService.sendScore && SocketService.sendScore(localStorage.getItem("userID"), score);
    }
  };

  return { gameOver, setGameOver, scoreUpdated, setScoreUpdated, score, setScore, checkGameOver };
};

describe("GameSolo", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('redirects to home if userID and username is missing', () => {
    localStorage.removeItem('userID');
    localStorage.removeItem('username');

    render(
      <MemoryRouter>
        <GameSolo />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/`);
  });

  test("affiche GameSoloView lorsque userID et username sont présents", () => {
    localStorage.setItem("userID", "user123");
    localStorage.setItem("username", "Alice");
    render(<GameSolo />);
    expect(screen.getByTestId("game-solo-view")).toBeInTheDocument();
    expect(screen.getByText(/score: 0/)).toBeInTheDocument();
  });

  test("réagit aux événements clavier", () => {
    localStorage.setItem("userID", "user123");
    localStorage.setItem("username", "Alice");
    render(<GameSolo />);
    act(() => {
      fireEvent.keyDown(window, { key: "ArrowLeft", code: "ArrowLeft" });
    });
    expect(screen.getByTestId("game-solo-view")).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowRight", code: "ArrowRight" });
    });
    expect(screen.getByTestId("game-solo-view")).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowDown", code: "ArrowDown" });
    });
    expect(screen.getByTestId("game-solo-view")).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowUp", code: "ArrowUp" });
    });
    expect(screen.getByTestId("game-solo-view")).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: " ", code: " " });
    });
    expect(screen.getByTestId("game-solo-view")).toBeInTheDocument();
  
    act(() => {
      fireEvent.keyDown(window, { key: "hhh", code: "hh" });
    });
    expect(screen.getByTestId("game-solo-view")).toBeInTheDocument();
  });

  test("simulate hard drop qui termine le jeu et déclenche gameOver", () => {
    localStorage.setItem("userID", "user123");
    localStorage.setItem("username", "Alice");

    render(
      <MemoryRouter>
        <GameSolo />
      </MemoryRouter>
    );
    act(() => {
      fireEvent.keyDown(window, { key: " ", code: "Space" });
    });
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByTestId("game-solo-view")).toHaveTextContent("GameSoloView: score: 0");
    // expect(SocketService.sendScore).toHaveBeenCalledWith("user123", expect.any(Number));
  });

  test("should trigger game over if a new piece cannot be placed", () => {
    localStorage.setItem("userID", "user123");
    localStorage.setItem("username", "Alice");
  
    // Simulate a filled board where no pieces can move
    GameSoloModel.canMove.mockImplementation(() => false);
    GameSoloController.movePiece.mockImplementation(() => false);
    GameSoloController.fixPiece.mockImplementation(() => ({ updatedBoard: [], clearedRowsCount: 0 }));
    GameSoloController.getNewPiece.mockImplementation(() => ({
      currentPiece: { x: 4, y: -1, shape: [[1, 1], [1, 1]] }, // Simulating game over state
      nextPiece: {},
    }));
  
    render(
      <MemoryRouter>
        <GameSolo />
      </MemoryRouter>
    );
  
    jest.useFakeTimers();
  
    act(() => {
      fireEvent.keyDown(window, { key: " ", code: "Space" }); // Hard drop
      jest.advanceTimersByTime(600);
    });
  
    // Expect the game to be over
    expect(screen.getByTestId("game-solo-view")).toHaveTextContent("GameSoloView: score: 0");
  });

  test("update SetScore", () => {
    localStorage.setItem("userID", "user123");
    localStorage.setItem("username", "Alice");
  
    // Simulate a filled board where no pieces can move
    GameSoloModel.canMove.mockImplementation(() => false);
    GameSoloController.movePiece.mockImplementation(() => false);
    GameSoloController.fixPiece.mockImplementation(() => ({ updatedBoard: [], clearedRowsCount: 0 }));
    GameSoloController.getNewPiece.mockImplementation(() => ({
      currentPiece: { x: 4, y: -1, shape: [[1, 1], [1, 1]] }, // Simulating game over state
      nextPiece: {},
    }));
  
    render(
      <MemoryRouter>
        <GameSolo />
      </MemoryRouter>
    );
  
    jest.useFakeTimers();
  
    act(() => {
      fireEvent.keyDown(window, { key: " ", code: "Space" }); // Hard drop
      jest.advanceTimersByTime(600);
    });
  
    // Expect the game to be over
    expect(screen.getByTestId("game-solo-view")).toHaveTextContent("GameSoloView: score: 0");
  });

  test("sur lineCLear update le score", () => {
    localStorage.setItem("userID", "user123");
    localStorage.setItem("username", "Alice");
  
    // Simulate a filled board where no pieces can move
    GameSoloModel.canMove.mockImplementation(() => false);
    GameSoloController.movePiece.mockImplementation(() => false);
    GameSoloController.fixPiece.mockImplementation(() => ({ updatedBoard: [], clearedRowsCount: 1 }));
    GameSoloController.getNewPiece.mockImplementation(() => ({
      currentPiece: { x: 4, y: -1, shape: [[1, 1], [1, 1]] }, // Simulating game over state
      nextPiece: {},
    }));
  
    render(
      <MemoryRouter>
        <GameSolo />
      </MemoryRouter>
    );
  
    jest.useFakeTimers();
  
    act(() => {
      fireEvent.keyDown(window, { key: " ", code: "Space" }); // Hard drop
      jest.advanceTimersByTime(600);
    });
  
    // Expect the game to be over
    expect(screen.getByTestId("game-solo-view")).toHaveTextContent("GameSoloView: score: 100");
  });

  test("sur gameOver update le score", () => {
    localStorage.setItem("userID", "user123");
    localStorage.setItem("username", "Alice");

    GameSoloController.movePiece.mockImplementation((board, piece, dx, dy) => {
      return piece.y === -1 ? null : { ...piece, x: piece.x + dx, y: piece.y + dy };
    });
    GameSoloController.fixPiece.mockImplementation(() => ({ updatedBoard: [], clearedRowsCount: 0 }));
    GameSoloController.getNewPiece.mockImplementation(() => ({
      currentPiece: { shape: [[1, 1]], x: 0, y: -1 },
      nextPiece: { shape: [[1, 1]], x: 0, y: 0 },
    }));
  
    render(
      <MemoryRouter initialEntries={["/solo"]}>
        <GameSolo />
      </MemoryRouter>
    );

    act(() => {
      fireEvent.keyDown(window, { key: " ", code: "Space" });
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(SocketService.sendScore).toHaveBeenCalledTimes(2);
  });

});
