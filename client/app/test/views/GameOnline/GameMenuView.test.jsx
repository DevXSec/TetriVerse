// GameMenuView.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameMenuView from '../../../src/views/GameOnline/GameMenuView';
import '@testing-library/jest-dom';

describe('GameMenuView', () => {
  const players = [{ name: 'Alice' }, { name: 'Bob' }];

  test('affiche le titre, la liste des joueurs et les boutons "Rejoindre une Partie" et "Créer une Partie" quand aucun roomId n’est fourni', () => {
    const onJoinGame = jest.fn();
    const onCreateGame = jest.fn();

    render(
      <GameMenuView
        players={players}
        roomId={null}
        waiting={false}
        onJoinGame={onJoinGame}
        onCreateGame={onCreateGame}
        username="Alice"
      />
    );

    expect(screen.getByText('Mode Online')).toBeInTheDocument();

    const joinButton = screen.getByRole('button', { name: /Rejoindre une Partie/i });
    const createButton = screen.getByRole('button', { name: /Créer une Partie/i });
    expect(joinButton).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();

    fireEvent.click(joinButton);
    fireEvent.click(createButton);
    expect(onJoinGame).toHaveBeenCalled();
    expect(onCreateGame).toHaveBeenCalled();
  });

  test('affiche "En attente..." quand un roomId est fourni et waiting vaut true', () => {
    render(
      <GameMenuView
        players={players}
        roomId="room1"
        waiting={true}
        onJoinGame={jest.fn()}
        onCreateGame={jest.fn()}
        username="Alice"
      />
    );

    expect(screen.getByText('En attente...')).toBeInTheDocument();
  });

  test('affiche "Partie en cours" avec le roomId quand un roomId est fourni et waiting vaut false', () => {
    render(
      <GameMenuView
        players={players}
        roomId="room1"
        waiting={false}
        onJoinGame={jest.fn()}
        onCreateGame={jest.fn()}
        username="Alice"
      />
    );

    expect(screen.getByText('🎮 Partie en cours : room1')).toBeInTheDocument();
  });
});
