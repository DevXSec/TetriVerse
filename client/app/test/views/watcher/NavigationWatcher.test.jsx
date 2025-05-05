import React from 'react';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import NavigationWatcher from '../../../src/views/watcher/NavigationWatcher';
import { useDispatch, useSelector } from 'react-redux';
import SocketService from '../../../src/services/SocketService';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../../src/services/SocketService', () => ({
  leaveGame: jest.fn(),
}));

describe('NavigationWatcher', () => {
  let dispatchMock;
  const fakeLocation = '/game';

  beforeEach(() => {
    dispatchMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);
    useSelector.mockReturnValue({ currentPage: '/' });
    jest.clearAllMocks();
  });

  const renderWithRouter = (initialPath = fakeLocation) => {
    const history = createMemoryHistory({ initialEntries: [initialPath] });
    return render(
      <Router location={history.location} navigator={history}>
        <NavigationWatcher />
      </Router>
    );
  };

  it('dispatches PAGE_CHANGE on mount if path is different', () => {
    renderWithRouter();
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'PAGE_CHANGE',
      payload: fakeLocation,
    });
  });

  it('dispatches PAGE_CLOSED on beforeunload and clears storage', () => {
    localStorage.setItem('gameStarted', 'true');
    localStorage.setItem('roomId', 'room123');
    localStorage.setItem('userID', 'user1');

    renderWithRouter();

    const event = new Event('beforeunload');
    window.dispatchEvent(event);

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'PAGE_CLOSED',
      payload: fakeLocation,
    });

    expect(SocketService.leaveGame).toHaveBeenCalledWith('room123', 'user1');
    expect(localStorage.getItem('gameStarted')).toBe(null);
    expect(localStorage.getItem('roomId')).toBe(null);
  });

  it('does not call leaveGame if roomId is not set', () => {
    localStorage.removeItem('roomId');
    localStorage.setItem('userID', 'user1');
    localStorage.setItem('gameStarted', 'true');

    renderWithRouter();

    const event = new Event('beforeunload');
    window.dispatchEvent(event);

    expect(SocketService.leaveGame).not.toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderWithRouter();

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'beforeunload',
      expect.any(Function)
    );
  });
});
