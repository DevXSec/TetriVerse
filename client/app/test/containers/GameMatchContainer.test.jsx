import React from 'react';
import { render, screen, act } from '@testing-library/react';
import GameMatchContainer from '../../src/containers/GameMatchContainer';
import SocketService from '../../src/services/SocketService';
import '@testing-library/jest-dom'

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});


jest.mock('react-router-dom', () => {
  const actualModule = jest.requireActual('react-router-dom');
  const navigateMock = jest.fn();
  global.__navigateMock = navigateMock;
  
  return {
    __esModule: true,
    ...actualModule,
    useParams: () => ({
      roomId: 'test-room',
      username: 'test-user'
    }),
    useNavigate: () => navigateMock,
  };
});

jest.mock("../../src/services/SocketService", () => ({
  connect: jest.fn(),
  getGameInfos: jest.fn(),
  startGame: jest.fn(),
  restartGame: jest.fn(),
  socket: {
    on: jest.fn(),
    off: jest.fn()
  }
}));

jest.mock('../../src/views/GameOnline/GameMatchView', () => (props) => (
  <div data-testid="game-match-view">{JSON.stringify(props)}</div>
));

describe('GameMatchContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('appelle SocketService.connect avec null si aucun userID n\'est présent dans localStorage', () => {
    localStorage.getItem.mockReturnValue(null);
    render(<GameMatchContainer />);
    expect(SocketService.connect).toHaveBeenCalledWith(null, 'test-user', 'test-room');
  });

  test('appelle SocketService.connect avec un userID si localStorage contient une valeur', () => {
    localStorage.getItem.mockReturnValue('user-123');
    render(<GameMatchContainer />);
    expect(SocketService.connect).toHaveBeenCalledWith('user-123', 'test-user', 'test-room');
  });

  test('appelle SocketService.getGameInfos si il y a un roomId', () => {
    render(<GameMatchContainer />);
    expect(SocketService.getGameInfos).toHaveBeenCalledWith('test-room');
  });

  test('appelle `navigate` vers /error si gameInfos retourne null', () => {
    render(<GameMatchContainer />);
    
    const gameInfosHandler = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gameInfos'
    )[1];

    act(() => {
      gameInfosHandler({ infos: null });
    })

    expect(global.__navigateMock).toHaveBeenCalledWith('/error');
  });

  test('met à jour l\'état `player` si gameInfos contient des données', () => {
    act(() => {
      render(<GameMatchContainer />);
    })
    
    const testInfos = { };
    const gameInfosHandler = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gameInfos'
    )[1];

    act(() => {
      gameInfosHandler({ infos: testInfos });
    });

    const view = screen.getByTestId('game-match-view');
    const props = JSON.parse(view.textContent);

    expect(props.player).toEqual(testInfos);
  });

  test('appelle setIsViewer si le joueur est spectateur', () => {
    localStorage.getItem.mockReturnValue('user-123');
    
    act(() => {
      render(<GameMatchContainer />);
    })

    const gameJoinedHandler = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gameJoined'
    )[1];

    act(() => {
      gameJoinedHandler({
        userIdPlayer1: 'player-1',
        userIdPlayer2: 'player-2',
        gameRoomId: 'room-1'
      });
    });

    const view = screen.getByTestId('game-match-view');
    const props = JSON.parse(view.textContent);

    expect(props.isViewer).toBe(true);
  });

  test('appelle setIsViewer si le joueur est spectateur dans handleViewer', () => {
    localStorage.getItem.mockReturnValue('userId3');
    
    act(() => {
      render(<GameMatchContainer />);
    })

    const gameViewerHandler = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gamePlayers'
    )[1];

    act(() => {
      gameViewerHandler({
        player1: 'userId1',
        player2: 'userId2'
      });
    });

    const view = screen.getByTestId('game-match-view');
    const props = JSON.parse(view.textContent);

    expect(props.isViewer).toBe(true);
  });

  test('appelle setIsViewer si le viewer devient joueur', () => {
    localStorage.getItem.mockReturnValue('userId3');
    
    act(() => {
      render(<GameMatchContainer />);
    })

    const gameViewerHandler = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gamePlayers'
    )[1];

    act(() => {
      gameViewerHandler({
        player1: 'userId1',
        player2: 'userId3'
      });
    });

    const view = screen.getByTestId('game-match-view');
    const props = JSON.parse(view.textContent);

    expect(props.isViewer).toBe(false);
  });

  test('appelle setLeaver si un joueur leave', () => {
    act(() => {
      render(<GameMatchContainer />);
    })

    const gameLeaverHandler = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gameInfosQuit'
    )[1];

    act(() => {
      gameLeaverHandler('player-1');
    });

    const view = screen.getByTestId('game-match-view');
    const props = JSON.parse(view.textContent);

    expect(props.leaver).toBe('player-1');
  });

  test('appelle setCurrentGame et setOpponentGame pour le jeu', () => {
    act(() => {
      render(<GameMatchContainer />);
    })

    const gameStateHandler = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gameState'
    )[1];
    
    act(() => {
      gameStateHandler({
        tetris1: {playerName: "player1", playerId: "userId1", grid: [], nextPiece: {}},
        tetris2: {playerName: "player2", playerId: "userId2", grid: [], nextPiece: {}}
      });
    });

    const view = screen.getByTestId('game-match-view');
    const props = JSON.parse(view.textContent);

    expect(props.currentGame).toEqual({"grid": [], "nextPiece": {}, "playerId": "userId1", "playerName": "player1"});
    expect(props.opponentGame).toEqual({"grid": [], "nextPiece": {}, "playerId": "userId2", "playerName": "player2"});
  });

  test('appelle setCurrentGame et setOpponentGame pour le jeu et le currentGame est celui de tetris2 si je suis le joueur2', () => {
    localStorage.getItem.mockReturnValue('userId2');
    
    render(<GameMatchContainer />);

    const gameStateHandler = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gameState'
    )[1];
    
    act(() => {
      gameStateHandler({
        tetris1: {playerName: "player1", playerId: "userId1", grid: [], nextPiece: {}},
        tetris2: {playerName: "player2", playerId: "userId2", grid: [], nextPiece: {}}
      });
    });

    const view = screen.getByTestId('game-match-view');
    const props = JSON.parse(view.textContent);

    expect(props.currentGame).toEqual({"grid": [], "nextPiece": {}, "playerId": "userId2", "playerName": "player2"});
    expect(props.opponentGame).toEqual({"grid": [], "nextPiece": {}, "playerId": "userId1", "playerName": "player1"});
  });

  test('appelle setGameOver lorsque gameOver est déclenché', () => {
    act(() => {
      render(<GameMatchContainer />);
    })

    const gameOverHandler = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gameOver'
    )[1];

    act(() => {
      gameOverHandler({ winner: 'player-1' });
    });

    const view = screen.getByTestId('game-match-view');
    const props = JSON.parse(view.textContent);

    expect(props.gameOver).toBe('');
  });

  test('appelle setLeaver lorsque on reset une game', () => {
    render(<GameMatchContainer />);

    const gameResetHandler = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'restart'
    )[1];

    act(() => {
      gameResetHandler();
    });

    const view = screen.getByTestId('game-match-view');
    const props = JSON.parse(view.textContent);

    expect(props.leaver).toBe('');
  });

  test('gère les événements SocketService et les nettoie lors du démontage', () => {
    const { unmount } = render(<GameMatchContainer />);

    expect(SocketService.socket.on).toHaveBeenCalledWith('gameOver', expect.any(Function));
    expect(SocketService.socket.on).toHaveBeenCalledWith('restart', expect.any(Function));
    expect(SocketService.socket.on).toHaveBeenCalledWith('gameInfos', expect.any(Function));
    expect(SocketService.socket.on).toHaveBeenCalledWith('gameState', expect.any(Function));
    expect(SocketService.socket.on).toHaveBeenCalledWith('gameJoined', expect.any(Function));
    expect(SocketService.socket.on).toHaveBeenCalledWith('gameInfosQuit', expect.any(Function));

    unmount();

    expect(SocketService.socket.off).toHaveBeenCalledWith('gameOver', expect.any(Function));
    expect(SocketService.socket.off).toHaveBeenCalledWith('restart', expect.any(Function));
    expect(SocketService.socket.off).toHaveBeenCalledWith('gameInfos', expect.any(Function));
    expect(SocketService.socket.off).toHaveBeenCalledWith('gameState', expect.any(Function));
    expect(SocketService.socket.off).toHaveBeenCalledWith('gameJoined', expect.any(Function));
    expect(SocketService.socket.off).toHaveBeenCalledWith('gameInfosQuit', expect.any(Function));
  });

});
