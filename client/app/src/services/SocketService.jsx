import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';

let socket;

const getSocket = () => {
  if (!socket) {
    const SOCKET_SERVER_URL =
      `http://${process.env.REACT_APP_HOST_IP}:${process.env.REACT_APP_SERVER_PORT}` ||
      'http://localhost:5000';

    socket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      transports: ['websocket'],
    });

    socket.on('connect_error', (err) => {
      console.error('Erreur de connexion Socket.IO :', err.message);
    });
  }
  return socket;
};

const connect = (userID, username, roomId) => {
  localStorage.setItem('username', username);
  if (!userID) {
    userID = uuidv4();
    localStorage.setItem('userID', userID);
  }
  getSocket().emit('setUsername', userID, username);

  if (roomId) {
    joinGame(roomId, username, userID);
  }
};

const joinGame = (roomId, username, userId) => {
  getSocket().emit('joinGame', roomId, username, userId);
};

const SocketService = {
  connect,
  getGameInfos: (roomId) => getSocket().emit('getInfos', roomId),
  restartGame: (roomId) => getSocket().emit('restartGame', roomId),
  checkUserID: (userID) => getSocket().emit('checkUserID', userID),
  onUserExists: (callback) => getSocket().on('userExists', callback),
  listenForPlayers: (setPlayers) => {
    getSocket().on('updatePlayers', (players) => {
      setPlayers(players);
    });
  },
  createGame: () => getSocket().emit('createGame'),
  startGame: (roomId, mode) => getSocket().emit('startGame', roomId, mode),
  joinRandomGame: () => getSocket().emit('joinRandomGame'),
  joinGame,
  sendScore: (userId, score) => getSocket().emit('updateScore', userId, score),
  leaveGame: (roomId, userId) => getSocket().emit('leaveGame', roomId, userId),
  sendMove: (direction) => {
    const roomId = localStorage.getItem('roomId');
    const userId = localStorage.getItem('userID');
    getSocket().emit('movePiece', roomId, userId, direction);
  },
  leaderBoard: () => getSocket().emit('getLeaderboard'),
  disconnect: () => getSocket().disconnect(),
  get socket() {
    return getSocket();
  },
};

const storedUsername = localStorage.getItem('username');
const storedUserID = localStorage.getItem('userID');
const storedRoomId = localStorage.getItem('roomId');

if (storedUsername) {
  connect(storedUserID, storedUsername, storedRoomId);
}

export default SocketService;