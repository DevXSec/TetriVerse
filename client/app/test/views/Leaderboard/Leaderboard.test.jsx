import React from 'react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SocketService from '../../../src/services/SocketService';
import Leaderboard from '../../../src/views/Leaderboard/Leaderboard';
import { render, screen, act, waitFor } from '@testing-library/react';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));

jest.mock('../../../src/services/SocketService', () => ({
  leaderBoard: jest.fn(),
  socket: {
    on: jest.fn(),
    off: jest.fn(),
  },
}));

describe('Leaderboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('userID', 'user123');
    localStorage.setItem('username', 'Alice');
  });

  test('redirects to home if userID and username is missing', () => {
    localStorage.removeItem('userID');
    localStorage.removeItem('username');

    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(`/`);
  });

  test('calls `SocketService.leaderBoard` on mount', () => {
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    expect(SocketService.leaderBoard).toHaveBeenCalledTimes(1);
  });

  test('listens to `leaderboardInfos` socket event and updates state', async () => {
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    const mockLeaderboardData = [
      { userId: 'user123', name: 'Alice', bestScore: 500 },
      { userId: 'user456', name: 'Bob', bestScore: 400 },
    ];

    // Simulate socket event
    act(() => {
      SocketService.socket.on.mock.calls[0][1]({ infos: mockLeaderboardData });
    });

    await waitFor(() => {
      expect(screen.getByText('Classement')).toBeInTheDocument();
      expect(screen.getByText('Moi')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('400')).toBeInTheDocument();
    });
  });

  test('cleans up socket event listener on unmount', () => {
    const { unmount } = render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    unmount();

    expect(SocketService.socket.off).toHaveBeenCalledTimes(1);
    expect(SocketService.socket.off).toHaveBeenCalledWith(
      'leaderboardInfos',
      expect.any(Function)
    );
  });

  test('renders no-data message when leaderboard is empty', () => {
    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    expect(
      screen.getByText('Personne dans le leaderboard. Faites une game en solo pour le mettre à jour!')
    ).toBeInTheDocument();
  });
});
