// GameMatchView.test.js
import React from 'react';
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom';
import GameMatchView from '../../../src/views/GameOnline/GameMatchView';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// On mocke les composants enfants pour simplifier les tests
jest.mock('../../../src/views/GameOnline/GameViewer', () => (props) => {
  return <div data-testid="game-viewer">GameViewer: {props.nextPiece}</div>;
});

jest.mock('../../../src/views/GameOnline/RestartButton', () => (props) => {
  return (
    <button data-testid="restart-button" onClick={props.onRestart}>
      Restart
    </button>
  );
});

describe('GameMatchView', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('userID', 'user123');
  });

  describe('Vue en attente de joueurs (waiting view)', () => {
    test('affiche la vue d’attente avec Room ID et le bouton Start si le joueur est l’utilisateur local', () => {
      const onStartGame = jest.fn();
      render(
        <GameMatchView
          roomId="room1"
          start={false}
          player="user123"
          onStartGame={onStartGame}
        />
      );

      expect(
        screen.getByText('En attente...')
      ).toBeInTheDocument();
      expect(screen.getByText('Room ID : room1')).toBeInTheDocument();

      const startButton = screen.getByRole('button', { name: /Classique/i });
      expect(startButton).toBeInTheDocument();
      fireEvent.click(startButton);
      expect(onStartGame).toHaveBeenCalled();
    });

    test("n'affiche pas le bouton Start si le joueur n'est pas l’utilisateur local", () => {
      render(
        <GameMatchView roomId="room1" start={false} player="otherUser" />
      );

      expect(
        screen.getByText('En attente...')
      ).toBeInTheDocument();
      expect(screen.getByText('Room ID : room1')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Classique/i })).toBeNull();
    });
  });

  describe('Vue de jeu (game view)', () => {
    const currentGame = {
      playerName: 'Alice',
      grid: [[0, 0]],
      playerId: 'user123',
      nextPiece: 'next1'
    };
    const opponentGame = {
      playerName: 'Bob',
      grid: [[1, 1]],
      playerId: 'user456',
      nextPiece: 'next2'
    };

    test('affiche le nom des joueurs pour un viewer', () => {
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGame}
          isViewer={true}
          player="user123"
        />
      );
      // Pour un viewer, on affiche les deux noms directement
      waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });
    });

    test('affiche la vue de jeu pour un viewer avec un adversaire sans playerName (BOT)', () => {
      const opponentGameNoName = { ...opponentGame, playerName: undefined };
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGameNoName}
          isViewer={true}
          player="user123"
        />
      );
      waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('BOT')).toBeInTheDocument();
      });
    });

    test('affiche la vue de jeu pour un non-viewer avec un adversaire ayant un playerName', () => {
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGame}
          isViewer={false}
          player="user123"
        />
      );

      waitFor(() => {
        expect(
          screen.getByText(`Adversaire trouvé: ${opponentGame.playerName}`)
        ).toBeInTheDocument();
      });
    });

    test('affiche la vue de jeu pour un non-viewer avec un adversaire sans playerName', () => {
      const opponentGameNoName = { ...opponentGame, playerName: undefined };
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGameNoName}
          isViewer={false}
          player="user123"
        />
      );

      waitFor(() => {
        expect(screen.getByText('Aucun adversaire...')).toBeInTheDocument();
      });
    });

    test('affiche le RestartButton si gameOver existe et que le joueur est l’utilisateur local', () => {
      const onRestart = jest.fn();
      // gameOver existe (peu importe son contenu) pour activer le rendu du RestartButton
      const gameOver = { userId: 'user456', name: 'Opponent' };
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGame}
          gameOver={gameOver}
          isViewer={true}
          player="user123"
          onRestart={onRestart}
        />
      );
      
      waitFor(() => {
        const restartButton = screen.getByTestId('restart-button');
        expect(restartButton).toBeInTheDocument();
        fireEvent.click(restartButton);
        expect(onRestart).toHaveBeenCalled();
      });
    });

    test('affiche "Game Over" pour un non-viewer si gameOver.userId est différent de l’utilisateur local', () => {
      const gameOver = { userId: 'user456', name: 'Opponent' };
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGame}
          gameOver={gameOver}
          isViewer={false}
          player="user123"
        />
      );
      waitFor(() => {
        expect(screen.getByText("Game Over")).toHaveClass('game-over').toBeInTheDocument();
      });
    });

    test('affiche "You Win" pour un non-viewer si gameOver.userId est égal à l’utilisateur local', () => {
      const gameOver = { userId: 'user123', name: 'Alice' };
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGame}
          gameOver={gameOver}
          isViewer={false}
          player="user123"
        />
      );
      waitFor(() => {
        expect(screen.getByText("You Win")).toHaveClass('game-win').toBeInTheDocument();
      });
    });

    test('affiche "X Win" pour un viewer quand gameOver est fourni', () => {
      const gameOver = { userId: 'user456', name: 'Alice' };
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGame}
          gameOver={gameOver}
          isViewer={true}
          player="user123"
        />
      );
      waitFor(() => {
        expect(screen.getByText("Alice Win")).toHaveClass('game-win').toBeInTheDocument();
      });
    });

    test('affiche "Game Over" quand gameOver est null', () => {
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGame}
          gameOver={null}
          isViewer={false}
          player="user123"
        />
      );
      waitFor(() => {
        expect(screen.getByText("Game Over")).toHaveClass('game-over').toBeInTheDocument();
      });
    });

    test('affiche "Bot Win" quand gameOver est null et isViewer est true', () => {
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGame}
          gameOver={null}
          isViewer={true}
          player="user123"
        />
      );
      // Plusieurs éléments "Game Over" peuvent être rendus
      waitFor(() => {
        expect(screen.getByText("Bot Win")).toHaveClass('game-win').toBeInTheDocument();
      });
    });

    test('affiche le message de victoire lié au leaver pour un non-viewer', () => {
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGame}
          leaver="Opponent"
          isViewer={false}
          player="user123"
        />
      );
      waitFor(() => {
        expect(screen.getByText("You Win")).toHaveClass('game-win').toBeInTheDocument();
      });
    });

    test('affiche le message de victoire lié au leaver pour un viewer', () => {
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGame}
          leaver="Opponent"
          isViewer={true}
          player="user123"
        />
      );
      waitFor(() => {
        expect(screen.getByText("Bob Win")).toHaveClass('game-win').toBeInTheDocument();
      });
    });

    test('rend deux composants GameViewer avec les bonnes props', () => {
      render(
        <GameMatchView
          start={true}
          currentGame={currentGame}
          opponentGame={opponentGame}
          isViewer={true}
          player="user123"
        />
      );

      waitFor(() => {
        const gameViewers = screen.getAllByTestId('game-viewer');
        expect(gameViewers).toHaveLength(2);
        expect(gameViewers[0]).toHaveTextContent('next1');
        expect(gameViewers[1]).toHaveTextContent('next2');
      });
    });
  });

  describe('Waiting Room State', () => {
    test('Displays waiting room UI with Room ID and Start button for host', async () => {
      const onStartGame = jest.fn();
      render(
        <MemoryRouter>
          <GameMatchView roomId="room1" start={{ current: false }} player="user123" onStartGame={onStartGame} />
        </MemoryRouter>
      );

      expect(screen.getByText('En attente...')).toBeInTheDocument();
      expect(screen.getByText('Room ID : room1')).toBeInTheDocument();

      const startButton = screen.getByRole('button', { name: /Classique/i });
      expect(startButton).toBeInTheDocument();
      fireEvent.click(startButton);
      expect(onStartGame).toHaveBeenCalled();
    });

    test('Displays waiting room UI with Room ID and Start mode button for host', async () => {
      const onStartGame = jest.fn();
      render(
        <MemoryRouter>
          <GameMatchView roomId="room1" start={{ current: false }} player="user123" onStartGame={onStartGame} />
        </MemoryRouter>
      );

      expect(screen.getByText('En attente...')).toBeInTheDocument();
      expect(screen.getByText('Room ID : room1')).toBeInTheDocument();

      const startModeButton = screen.getByRole('button', { name: /Invisible/i });
      expect(startModeButton).toBeInTheDocument();
      fireEvent.click(startModeButton);
      expect(onStartGame).toHaveBeenCalled();
    });

    test('Does not display Start button for non-host players', () => {
      render(
        <MemoryRouter>
          <GameMatchView roomId="room1" start={{ current: false }} player="otherUser" />
        </MemoryRouter>
      );

      expect(screen.getByText('En attente...')).toBeInTheDocument();
      expect(screen.getByText('Room ID : room1')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Classique/i })).toBeNull();
    });
  });

  describe('Game Started View', () => {
    const currentGame = {
      playerName: 'Alice',
      grid: [[0, 0]],
      playerId: 'user123',
      nextPiece: 'next1',
    };
    const opponentGame = {
      playerName: 'Bob',
      grid: [[1, 1]],
      playerId: 'user456',
      nextPiece: 'next2',
    };

    test('Displays player names for a viewer', async () => {
      render(
        <MemoryRouter>
          <GameMatchView start={{ current: true }} currentGame={currentGame} opponentGame={opponentGame} isViewer={true} player="user123" />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });
    });

    test('Displays "BOT" if opponent has no name', async () => {
      const opponentGameNoName = { ...opponentGame, playerName: undefined };
      render(
        <MemoryRouter>
          <GameMatchView start={{ current: true }} currentGame={currentGame} opponentGame={opponentGameNoName} isViewer={true} player="user123" />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('BOT')).toBeInTheDocument();
      });
    });

    test('Displays opponent name for a non-viewer', async () => {
      render(
        <MemoryRouter>
          <GameMatchView start={{ current: true }} currentGame={currentGame} opponentGame={opponentGame} isViewer={false} player="user123" />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(`Adversaire trouvé: ${opponentGame.playerName}`)).toBeInTheDocument();
      });
    });

    test('Displays "Aucun adversaire..." if no opponent found', async () => {
      const opponentGameNoName = { ...opponentGame, playerName: undefined };
      render(
        <MemoryRouter>
          <GameMatchView start={{ current: true }} currentGame={currentGame} opponentGame={opponentGameNoName} isViewer={false} player="user123" />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Aucun adversaire...')).toBeInTheDocument();
      });
    });
  });

  describe('Game Over Scenarios', () => {
    const currentGame = { playerName: 'Alice', grid: [[0, 0]], playerId: 'user123', nextPiece: 'next1' };
    const opponentGame = { playerName: 'Bob', grid: [[1, 1]], playerId: 'user456', nextPiece: 'next2' };

    test('Displays "Game Over" for non-viewer when opponent wins', async () => {
      const gameOver = { userId: 'user456', name: 'Opponent' };
      render(
        <MemoryRouter>
          <GameMatchView start={{ current: true }} currentGame={currentGame} opponentGame={opponentGame} gameOver={gameOver} isViewer={false} player="user123" />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Game Over")).toHaveClass('game-over');
      });
    });

    test('Displays "You Win" when the player wins', async () => {
      const gameOver = { userId: 'user123', name: 'Alice' };
      render(
        <MemoryRouter>
          <GameMatchView start={{ current: true }} currentGame={currentGame} opponentGame={opponentGame} gameOver={gameOver} isViewer={false} player="user123" />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("You Win")).toHaveClass('game-win');
      });
    });

    test('Displays "Bot Win" if gameOver is null and viewer is true', async () => {
      render(
        <MemoryRouter>
          <GameMatchView start={{ current: true }} currentGame={currentGame} opponentGame={opponentGame} gameOver={null} isViewer={true} player="user123" />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText("Bot Win")).toHaveClass('game-win');
      });
    });
  });

  describe('Game Restart', () => {
    test('Displays restart button and calls `onRestart` when clicked', async () => {
      const onRestart = jest.fn();
      const gameOver = { userId: 'user456', name: 'Opponent' };

      render(
        <MemoryRouter>
          <GameMatchView start={{ current: true }} currentGame={{ playerId: 'user123' }} opponentGame={{}} gameOver={gameOver} player="user123" onRestart={onRestart} />
        </MemoryRouter>
      );

      await waitFor(() => {
        const restartButton = screen.getByTestId('restart-button');
        expect(restartButton).toBeInTheDocument();
        fireEvent.click(restartButton);
        expect(onRestart).toHaveBeenCalled();
      });
    });
  });

  describe('GameViewer Component', () => {
    test('Renders two `GameViewer` components with correct props', async () => {
      render(
        <MemoryRouter>
          <GameMatchView start={{ current: true }} currentGame={{ nextPiece: 'next1' }} opponentGame={{ nextPiece: 'next2' }} isViewer={true} />
        </MemoryRouter>
      );

      await waitFor(() => {
        const gameViewers = screen.getAllByTestId('game-viewer');
        expect(gameViewers).toHaveLength(2);
        expect(gameViewers[0]).toHaveTextContent('next1');
        expect(gameViewers[1]).toHaveTextContent('next2');
      });
    });
  });
});
