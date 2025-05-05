import React from 'react';
import '@testing-library/jest-dom';
import { useSelector } from 'react-redux';
import { render } from '@testing-library/react';
import SocketService from '../../../src/services/SocketService';
import LeaveGame from '../../../src/views/LeaveGame/LeaveGame';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('../../../src/services/SocketService', () => ({
  leaveGame: jest.fn(),
}));

describe('LeaveGame', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('appelle leaveGame et supprime roomId quand currentPage !== previousPage et currentPage ne contient pas roomId', () => {
    localStorage.setItem("roomId", "room123");
    localStorage.setItem("userID", "user456");

    useSelector.mockImplementation(selector =>
      selector({ navigation: { currentPage: "/other", previousPage: "/home" } })
    );

    render(<LeaveGame />);

    expect(SocketService.leaveGame).toHaveBeenCalledWith("room123", "user456");
    expect(localStorage.getItem("roomId")).toBeNull();
  });

  test('n’appelle pas leaveGame quand currentPage === previousPage', () => {
    localStorage.setItem("roomId", "room123");
    localStorage.setItem("userID", "user456");

    useSelector.mockImplementation(selector =>
      selector({ navigation: { currentPage: "/same", previousPage: "/same" } })
    );

    render(<LeaveGame />);

    expect(SocketService.leaveGame).not.toHaveBeenCalled();
    expect(localStorage.getItem("roomId")).toBe("room123");
  });

  test('n’appelle pas leaveGame quand currentPage contient roomId', () => {
    localStorage.setItem("roomId", "room123");
    localStorage.setItem("userID", "user456");

    useSelector.mockImplementation(selector =>
      selector({ navigation: { currentPage: "/game/room123", previousPage: "/home" } })
    );

    render(<LeaveGame />);

    expect(SocketService.leaveGame).not.toHaveBeenCalled();
    expect(localStorage.getItem("roomId")).toBe("room123");
  });
});
