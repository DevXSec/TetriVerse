import SocketService from '../services/SocketService';
import { useParams, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import GameMatchView from '../../src/views/GameOnline/GameMatchView';

const GameMatchContainer = () => {
  const start = useRef(false);
  const gameOver = useRef('');
  const navigate = useNavigate();
  const { roomId, username } = useParams();
  const [leaver, setLeaver] = useState('');
  const [player, setPlayer] = useState({});
  const [isViewer, setIsViewer] = useState(false);
  const [currentGame, setCurrentGame] = useState({});
  const [opponentGame, setOpponentGame] = useState({});


  useEffect(() => {
    if (!localStorage.getItem('userID')) {
      SocketService.connect && SocketService.connect(null, username, roomId);
    } else {
      SocketService.connect && SocketService.connect(localStorage.getItem('userID'), username, roomId);
    }

    if (roomId) {
      SocketService.getGameInfos && SocketService.getGameInfos(roomId);
    }

    const handleGameInfos = ({ infos }) => {
      if (infos === null)  {
        return navigate(`/error`);
      }
      setPlayer(infos)
    };

    const handleGameJoined = ({ userIdPlayer1, userIdPlayer2, gameRoomId }) => {
      localStorage.setItem('roomId', gameRoomId);
      if (userIdPlayer1 !== localStorage.getItem('userID') && (!userIdPlayer2 || userIdPlayer2 !== localStorage.getItem('userID'))) {
        setIsViewer(true);
      }
    };

    const handleViewer = ({ player1, player2 }) => {
      if (player1 !== localStorage.getItem('userID') && (!player2 || player2 !== localStorage.getItem('userID'))) {
        setIsViewer(true);
      } else if (player1 === localStorage.getItem('userID') || (player2 && player2 === localStorage.getItem('userID'))) {
        setIsViewer(false);
      }
    };

    const handleGameState = ({ tetris1, tetris2 }) => {
      if (!start.current) {
        start.current = true;
        if (!localStorage.getItem("gameStarted")) {
          localStorage.setItem('gameStarted', roomId);
        }
      }
      if (tetris2.playerId && tetris2.playerId === localStorage.getItem('userID')) {
        setCurrentGame(tetris2);
        setOpponentGame(tetris1);
      } else {
        setCurrentGame(tetris1);
        setOpponentGame(tetris2);
      }
    };

    const handleGameInfosQuit = (leaver) => {
      if (localStorage.getItem("gameStarted")) {
        localStorage.removeItem('gameStarted');
      }
      if (leaver) {
        setLeaver(leaver);
      }
    }

    const handleGameOver = ({ winner }) => {
      if (localStorage.getItem("gameStarted")) {
        localStorage.removeItem('gameStarted');
      }
      gameOver.current = winner;
    };
    
    const handleResetParam = () => {
      gameOver.current = '';
      setLeaver('');
    };

    SocketService.socket.on('gameOver', handleGameOver);
    SocketService.socket.on('gamePlayers', handleViewer);
    SocketService.socket.on('restart', handleResetParam);
    SocketService.socket.on('gameInfos', handleGameInfos);
    SocketService.socket.on('gameState', handleGameState);
    SocketService.socket.on('gameJoined', handleGameJoined);
    SocketService.socket.on('gameInfosQuit', handleGameInfosQuit);

    return () => {
      SocketService.socket.off('gameOver', handleGameOver);
      SocketService.socket.off('gamePlayers', handleViewer);
      SocketService.socket.off('restart', handleResetParam);
      SocketService.socket.off('gameInfos', handleGameInfos);
      SocketService.socket.off('gameState', handleGameState);
      SocketService.socket.off('gameJoined', handleGameJoined);
      SocketService.socket.off('gameInfosQuit', handleGameInfosQuit);
    };
  }, [start, player, isViewer]);

  const handleStartGame = (mode) => {
    SocketService.startGame && SocketService.startGame(roomId, mode);
  };

  const handleRestart = () => {
    SocketService.restartGame && SocketService.restartGame(roomId);
  };

  return (
    <GameMatchView
      roomId={roomId}
      start={start}
      player={player}
      leaver={leaver}
      currentGame={currentGame}
      opponentGame={opponentGame}
      gameOver={gameOver.current}
      isViewer={isViewer}
      onRestart={handleRestart}
      onStartGame={handleStartGame}
    />
  );
};

export default GameMatchContainer;

// npm test test/containers/GameMatchContainer.test.jsx --env=jsdom
// npm test -- --coverage test/containers/GameMatchContainer.test.jsx --env=jsdom
