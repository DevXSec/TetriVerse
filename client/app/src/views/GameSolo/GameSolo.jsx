import GameSoloView from "./GameSoloView";
import randomPiece from "../../models/Piece";
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from "react";
import SocketService from '../../services/SocketService';
import { movePiece, fixPiece, getNewPiece } from "../../controllers/GameSoloController";
import { createEmptyBoard, drawPiece, canMove, rotateMatrix } from "../../models/GameSoloModel";

const GameSolo = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState(createEmptyBoard());
  const boardRef = useRef(board);
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [scoreUpdated, setScoreUpdated] = useState(false);
  const [pieceState, setPieceState] = useState({
    currentPiece: randomPiece(),
    nextPiece: randomPiece()
  });
  const [grid, setGrid] = useState(createEmptyBoard());

  const moveCurrentPiece = (dx, dy) => {
    if (gameOver) return;
    setPieceState((prevState) => {
      const movedPiece = movePiece(board, prevState.currentPiece, dx, dy);
      if (dy === 1 && movedPiece === null) {
        const { updatedBoard, clearedRowsCount } = fixPiece(board, prevState.currentPiece);
        setBoard(updatedBoard);
        if (clearedRowsCount > 0) {
          setScore(prev => prev + clearedRowsCount * 100);
        }
        const newPieces = getNewPiece(prevState.nextPiece);
        if (!movePiece(updatedBoard, newPieces.currentPiece, 0, 0)) {
          setGameOver(true);
        }
        return newPieces;
      }
      if (movedPiece === null) return prevState;
      return { ...prevState, currentPiece: movedPiece };
    });
  };

  const hardDropCurrentPiece = () => {
    if (gameOver) return;
    setPieceState((prevState) => {
      for (var i = 0; i < 20; i ++) {
        if (!canMove(board, prevState.currentPiece, prevState.currentPiece.x, prevState.currentPiece.y + 1)) {
          const { updatedBoard, clearedRowsCount } = fixPiece(board, prevState.currentPiece);
          setBoard(updatedBoard);
          if (clearedRowsCount > 0) {
            setScore(prev => prev + clearedRowsCount * 100);
          }
          const newPieces = getNewPiece(prevState.nextPiece);
          newPieces.currentPiece.y = -1;
          if (!movePiece(updatedBoard, newPieces.currentPiece, 0, 0)) {
            setGameOver(true);
          }
          return newPieces;
        }
        prevState.currentPiece.y = prevState.currentPiece.y + 1;
      }
      return prevState;
    });
  };

  const rotateCurrentPiece = () => {
    if (gameOver) return;

    setPieceState((prevState) => {
      const rotatedShape = rotateMatrix(prevState.currentPiece.shape);

      const rotatedPiece = { 
        ...prevState, 
        currentPiece: { 
          ...prevState.currentPiece, 
          shape: rotatedShape 
        } 
      };

      const minX = rotatedPiece.currentPiece.x;
      const maxX = rotatedPiece.currentPiece.x + rotatedShape[0].length;

      if (minX < 0 || maxX > 10) {
        return prevState;
      }

      if (canMove(board, rotatedPiece.currentPiece, rotatedPiece.currentPiece.x, rotatedPiece.currentPiece.y)) {
        movePiece(board, rotatedPiece.currentPiece, rotatedPiece.currentPiece.x, rotatedPiece.currentPiece.y);
        return rotatedPiece;
      }
      return prevState;
    });
  };

  useEffect(() => {
    if (!localStorage.getItem("userID") || !localStorage.getItem("username")) {
      navigate(`/`);
    }
  }, []);

  useEffect(() => {
    setGrid(drawPiece(board, pieceState.currentPiece));
  }, [pieceState, board]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) {
        moveCurrentPiece(0, 1);
      } else if (gameOver && !scoreUpdated) {
        setScoreUpdated(true);
        SocketService.sendScore && SocketService.sendScore(localStorage.getItem("userID"), score);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [gameOver, board, scoreUpdated]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      event.preventDefault();
      if (gameOver) return;
      switch (event.key) {
        case "ArrowLeft":
          moveCurrentPiece(-1, 0);
          break;
        case "ArrowRight":
          moveCurrentPiece(1, 0);
          break;
        case "ArrowDown":
          moveCurrentPiece(0, 1);
          break;
        case "ArrowUp":
          rotateCurrentPiece();
          break;
        case " ":
          hardDropCurrentPiece();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, board, pieceState]);

  return (
    <GameSoloView
      grid={grid}
      score={score}
      nextPiece={pieceState.nextPiece}
      gameOver={gameOver}
    />
  );
};

export default GameSolo;

// npm test -- --coverage test/views/GameSolo/GameSolo.test.jsx --env=jsdom