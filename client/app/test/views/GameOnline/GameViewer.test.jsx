import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import GameViewer from '../../../src/views/GameOnline/GameViewer';
import SocketService from '../../../src/services/SocketService';
import '@testing-library/jest-dom';

jest.mock('../../../src/services/SocketService', () => ({
  sendMove: jest.fn(),
}));

describe('GameViewer', () => {
  const grid = [
    ['red', 0],
    ['blue', 'green']
  ];

  const nextPiece = {
    shape: [
      [1, 0],
      [0, 1]
    ],
    color: 'yellow'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rend la grille avec les bonnes couleurs', () => {
    const { container } = render(
      <GameViewer grid={grid} nextPiece={nextPiece} local={false} />
    );
    const cellElements = container.querySelectorAll('.cell');
    expect(cellElements).toHaveLength(4);
    expect(cellElements[0]).toHaveStyle({ backgroundColor: 'red' });
    expect(cellElements[1]).toHaveStyle({ backgroundColor: 'black' });
    expect(cellElements[2]).toHaveStyle({ backgroundColor: 'blue' });
    expect(cellElements[3]).toHaveStyle({ backgroundColor: 'green' });
  });

  test('rend le next piece avec les bonnes couleurs', () => {
    const { container } = render(
      <GameViewer grid={grid} nextPiece={nextPiece} local={false} />
    );
    const nextPieceCells = container.querySelectorAll('.next-piece-cell');
    expect(nextPieceCells).toHaveLength(4);
    expect(nextPieceCells[0]).toHaveStyle({ backgroundColor: 'yellow' });
    expect(nextPieceCells[1]).toHaveStyle({ backgroundColor: 'transparent' });
    expect(nextPieceCells[2]).toHaveStyle({ backgroundColor: 'transparent' });
    expect(nextPieceCells[3]).toHaveStyle({ backgroundColor: 'yellow' });
  });

  test('déclenche SocketService.sendMove sur les événements clavier quand local est true', () => {
    render(<GameViewer grid={grid} nextPiece={nextPiece} local={true} />);
    
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(SocketService.sendMove).toHaveBeenCalledWith('left');

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(SocketService.sendMove).toHaveBeenCalledWith('right');

    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(SocketService.sendMove).toHaveBeenCalledWith('down');

    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(SocketService.sendMove).toHaveBeenCalledWith('rotate');

    fireEvent.keyDown(window, { key: ' ' });
    expect(SocketService.sendMove).toHaveBeenCalledWith('hardDown');

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(SocketService.sendMove).toHaveBeenCalledWith('hardDown');
  });

  test('n’exécute pas SocketService.sendMove sur les événements clavier quand local est false', () => {
    render(<GameViewer grid={grid} nextPiece={nextPiece} local={false} />);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(SocketService.sendMove).not.toHaveBeenCalled();
  });
});
