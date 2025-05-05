import SocketService from '../../src/services/SocketService';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// On simule la génération d'UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('SocketService', () => {
  let service;
  let mockEmit;
  let mockOn;
  let mockDisconnect;

  beforeEach(() => {
    localStorage.clear();
    jest.resetModules();
    service = require('../../src/services/SocketService').default;
    
    mockEmit = service.socket.emit;
    mockOn = service.socket.on;
    mockDisconnect = service.socket.disconnect;
    
    jest.clearAllMocks();
  });

  test('connect : devrait émettre "setUsername" et "joinGame" si roomId est fourni', () => {
    service.connect('', 'Alice', 'room123');
    expect(localStorage.getItem('username')).toBe('Alice');
    expect(localStorage.getItem('userID')).toBe('test-uuid');
    expect(mockEmit).toHaveBeenCalledWith('setUsername', 'test-uuid', 'Alice');
    expect(mockEmit).toHaveBeenCalledWith('joinGame', 'room123', 'Alice', 'test-uuid');
  });

  test('connect : ne devrait pas émettre "joinGame" si aucun roomId n\'est fourni', () => {
    service.connect('', 'Bob', '');
    expect(localStorage.getItem('username')).toBe('Bob');
    expect(localStorage.getItem('userID')).toBe('test-uuid');
    expect(mockEmit).toHaveBeenCalledWith('setUsername', 'test-uuid', 'Bob');
    expect(mockEmit).not.toHaveBeenCalledWith('joinGame', expect.anything(), expect.anything(), expect.anything());
  });

  test('getGameInfos : devrait émettre "getInfos" avec le roomId', () => {
    service.getGameInfos('room123');
    expect(mockEmit).toHaveBeenCalledWith('getInfos', 'room123');
  });

  test('restartGame : devrait émettre "restartGame" avec le roomId', () => {
    service.restartGame('room123');
    expect(mockEmit).toHaveBeenCalledWith('restartGame', 'room123');
  });

  test('checkUserID : devrait émettre "checkUserID" avec le userID', () => {
    service.checkUserID('user123');
    expect(mockEmit).toHaveBeenCalledWith('checkUserID', 'user123');
  });

  test('createGame : devrait émettre "createGame"', () => {
    service.createGame();
    expect(mockEmit).toHaveBeenCalledWith('createGame');
  });

  test('startGame : devrait émettre "startGame" avec le roomId et le mode', () => {
    service.startGame('room123', 0);
    expect(mockEmit).toHaveBeenCalledWith('startGame', 'room123', 0);
  });

  test('joinRandomGame : devrait émettre "joinRandomGame"', () => {
    service.joinRandomGame();
    expect(mockEmit).toHaveBeenCalledWith('joinRandomGame');
  });

  test('joinGame : devrait émettre "joinGame" avec les paramètres fournis', () => {
    service.joinGame('room123', 'Alice', 'user123');
    expect(mockEmit).toHaveBeenCalledWith('joinGame', 'room123', 'Alice', 'user123');
  });

  test('sendScore : devrait émettre "updateScore" avec les paramètres fournis', () => {
    service.sendScore('userId1', 100);
    expect(mockEmit).toHaveBeenCalledWith('updateScore', 'userId1', 100);
  });

  test('leaveGame : devrait émettre "leaveGame" avec les paramètres fournis', () => {
    service.leaveGame('room123', 'user123');
    expect(mockEmit).toHaveBeenCalledWith('leaveGame', 'room123', 'user123');
  });

  test('sendMove : devrait émettre "movePiece" avec les infos stockées dans localStorage', () => {
    localStorage.setItem('roomId', 'room123');
    localStorage.setItem('userID', 'user123');
    service.sendMove('up');
    expect(mockEmit).toHaveBeenCalledWith('movePiece', 'room123', 'user123', 'up');
  });

  test('leaderBoard : devrait émettre "getLeaderboard"', () => {
    service.leaderBoard();
    expect(mockEmit).toHaveBeenCalledWith('getLeaderboard');
  });

  test('disconnect : devrait appeler la méthode disconnect du socket', () => {
    service.disconnect();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  test('listenForPlayers : devrait appeler setPlayers quand l\'événement "updatePlayers" est déclenché', () => {
    const setPlayersMock = jest.fn();
    let updatePlayersCallback;
    mockOn.mockImplementation((event, callback) => {
      if (event === 'updatePlayers') {
        updatePlayersCallback = callback;
      }
    });
    service.listenForPlayers(setPlayersMock);
    const playersData = [{ username: 'Alice' }, { username: 'Bob' }];
    updatePlayersCallback(playersData);
    expect(setPlayersMock).toHaveBeenCalledWith(playersData);
  });
});