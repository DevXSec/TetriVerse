import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import SocketService from '../services/SocketService';
import GameMenuView from '../views/GameOnline/GameMenuView';
import OnlineGameController from '../controllers/OnlineGameController';

const GameMenuContainer = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const username = localStorage.getItem('username') || 'Guest';

  const [gameController] = useState(() => OnlineGameController(
    localStorage.getItem("roomId"),
    localStorage.getItem("userID")
  ));

  useEffect(() => {
    if (!localStorage.getItem("userID") || !localStorage.getItem("username")) {
      navigate(`/`);
    }

    SocketService.socket.on('gameWaiting', ({ roomId }) => {
      localStorage.setItem('roomId', roomId);
      setRoomId(roomId);
      setWaiting(true);
      navigate(`/${roomId}/${username}`);
    });

    SocketService.socket.on('noGameFound', () => {
      setErrorMessage('Aucune game trouvée. Vous devez en créer une.');
    });
    
    SocketService.socket.on('gameFound', ({ roomId }) => {
      localStorage.setItem('roomId', roomId);
      setRoomId(roomId);
      setWaiting(false);
      navigate(`/${roomId}/${username}`);
      SocketService.joinGame && SocketService.joinGame(roomId, username, localStorage.getItem('userID'));
    });

    SocketService.socket.on('gameStarted', ({ roomId }) => {
      localStorage.setItem('roomId', roomId);
      setRoomId(roomId);
      setWaiting(false);
      setGameStarted(true);
      navigate(`/${roomId}/${username}`);
    });

    return () => {
      SocketService.socket.off("gameFound");
      SocketService.socket.off("gameWaiting");
      SocketService.socket.off("noGameFound");
      SocketService.socket.off("gameStarted");
    };
  }, [username, navigate]);

  const handleCreateGame = () => {
    gameController.createGame();
  };

  const handleJoinGame = () => {
    gameController.joinRandomGame();
  };

  return (
    <GameMenuView
      roomId={roomId}
      waiting={waiting}
      errorMessage={errorMessage}
      onJoinGame={handleJoinGame}
      onCreateGame={handleCreateGame}
    />
  );
};

export default GameMenuContainer;


// npm test -- --coverage test/containers/GameMenuContainer.test.jsx --env=jsdom