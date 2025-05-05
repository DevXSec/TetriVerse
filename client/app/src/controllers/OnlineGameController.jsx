import SocketService from "../services/SocketService";

const OnlineGameController = (initialRoomId = null, initialUserId = null) => {
  let roomId = initialRoomId;
  let userId = initialUserId;

  const setIdentifiers = ({ roomId: newRoomId, userId: newUserId }) => {
    roomId = newRoomId;
    userId = newUserId;
  };

  const createGame = () => {
    SocketService.createGame?.();
  };

  const joinRandomGame = () => {
    SocketService.joinRandomGame?.();
  };

  const sendMove = (direction) => {
    if (roomId && userId) {
      SocketService.sendMove(roomId, userId, direction);
    }
  };

  const startGame = () => {
    if (roomId) {
      SocketService.startGame?.(roomId);
    }
  };

  const restartGame = () => {
    if (roomId) {
      SocketService.restartGame?.(roomId);
    }
  };

  return {
    setIdentifiers,
    createGame,
    joinRandomGame,
    sendMove,
    startGame,
    restartGame,
  };
};

export default OnlineGameController;
