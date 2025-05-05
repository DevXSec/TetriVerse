// GameMenuContainer.test.jsx
import React from 'react';
import { useNavigate } from "react-router-dom";
import SocketService from '../../src/services/SocketService';
import GameMenuContainer from '../../src/containers/GameMenuContainer';
import OnlineGameController from "../../src/controllers/OnlineGameController";
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
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
      useNavigate: jest.fn(),
    };
  });

jest.mock('../../src/services/SocketService', () => ({
  joinGame: jest.fn(),
  socket: {
    on: jest.fn(),
    off: jest.fn(),
  }
}));

// Mock du contrôleur OnlineGameController
jest.mock('../../src/controllers/OnlineGameController');

// Mock du composant GameMenuView pour capturer les props
jest.mock('../../src/views/GameOnline/GameMenuView', () => (props) => {
  capturedProps = props;
  return <div data-testid="game-menu-view">{JSON.stringify(props)}</div>
});

let capturedProps = {};

describe('GameMenuContainer', () => {
  let mockCreateGame, mockJoinGame, mockGameControllerInstance;
  // Avant chaque test, réinitialiser les mocks et définir les valeurs de localStorage
  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateGame = jest.fn();
    mockJoinGame = jest.fn();

    mockGameControllerInstance = {
      createGame: mockCreateGame,
      joinGame: mockJoinGame
    };

    // Mock the class to return our instance
    OnlineGameController.mockImplementation(() => mockGameControllerInstance);

    delete window.location;
    window.location = { reload: jest.fn() };

    localStorage.clear();
    // Définir une valeur pour 'username' (utilisé dans le composant)
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'username') return 'TestUser';
      if (key === 'roomId') return null;
      if (key === 'userID') return 'user-123';
      return null;
    });
  });

  test('réagit à l\'événement "gameWaiting"', () => {
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock); 

    render(<GameMenuContainer />);
    const gameWaitingCallback = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gameWaiting'
    )[1];
    act(() => {
      gameWaitingCallback({ roomId: 'room-1' });
    });
    // Vérifie que localStorage.setItem a été appelé avec le roomId
    expect(localStorage.setItem).toHaveBeenCalledWith('roomId', 'room-1');
    // Vérifie que navigate a été appelé avec le bon chemin
    expect(navigateMock).toHaveBeenCalledWith('/room-1/TestUser');
    // Vérifie que l'état waiting est true via les props passées à GameMenuView
    const view = screen.getByTestId('game-menu-view');
    const props = JSON.parse(view.textContent);
    expect(props.waiting).toBe(true);
    expect(props.roomId).toBe('room-1');
  });

  test('réagit à l\'événement "gameFound"', () => {
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock); 

    render(<GameMenuContainer />);
    const gameFoundCallback = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gameFound'
    )[1];
    act(() => {
      gameFoundCallback({ roomId: 'room-2' });
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('roomId', 'room-2');
    expect(navigateMock).toHaveBeenCalledWith('/room-2/TestUser');
    expect(SocketService.joinGame).toHaveBeenCalledWith('room-2', 'TestUser', 'user-123');
    const view = screen.getByTestId('game-menu-view');
    const props = JSON.parse(view.textContent);
    expect(props.waiting).toBe(false);
    expect(props.roomId).toBe('room-2');
  });

  test('réagit à l\'événement "gameStarted"', () => {
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock); 

    render(<GameMenuContainer />);
    const gameStartedCallback = SocketService.socket.on.mock.calls.find(
      (call) => call[0] === 'gameStarted'
    )[1];
    act(() => {
      gameStartedCallback({ roomId: 'room-3' });
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('roomId', 'room-3');
    expect(navigateMock).toHaveBeenCalledWith('/room-3/TestUser');
    const view = screen.getByTestId('game-menu-view');
    const props = JSON.parse(view.textContent);
    expect(props.waiting).toBe(false);
    // On ne transmet pas gameStarted à GameMenuView, mais il est géré en interne
    expect(props.roomId).toBe('room-3');
  });

  test('nettoie les écouteurs SocketService lors du démontage', () => {
    const { unmount } = render(<GameMenuContainer />);
    unmount();
    expect(SocketService.socket.off).toHaveBeenCalledWith('gameWaiting');
    expect(SocketService.socket.off).toHaveBeenCalledWith('gameFound');
    expect(SocketService.socket.off).toHaveBeenCalledWith('gameStarted');
  });

  test('appelle createGame via onCreateGame', () => {
    render(<GameMenuContainer />);

    waitFor(() => {
      const createGameButton = screen.getByText("Créer une Partie");
      expect(createGameButton).toBeInTheDocument();
  
      // Click the button
      act(() => {
        fireEvent.click(createGameButton);
      });
  
      // Verify createGame was called
      expect(mockCreateGame).toHaveBeenCalled();
    });
  });

  test('appelle joinRandomGame via onJoinGame', () => {
    render(<GameMenuContainer />);

    waitFor(() => {
      const joinGameButton = screen.getByText("Rejoindre une Partie");
      expect(joinGameButton).toBeInTheDocument();
  
      // Click the button
      act(() => {
        fireEvent.click(joinGameButton);
      });
  
      // Verify createGame was called
      expect(mockJoinGame).toHaveBeenCalled();
    });
  });
});


