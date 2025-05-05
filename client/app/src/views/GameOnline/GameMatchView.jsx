import React from 'react';
import GameViewer from './GameViewer';
import RestartButton from './RestartButton';

const GameMatchView = ({
  roomId,
  start,
  player,
  leaver,
  currentGame,
  opponentGame,
  gameOver,
  isViewer,
  onRestart,
  onStartGame
}) => {
  if (start.current && currentGame && opponentGame) {
    return (
      <div className="game-view">
        {isViewer ? (
          opponentGame.playerName ? (
            <div className='players'>
              <h1>{currentGame.playerName}</h1>
              <h1>{opponentGame.playerName}</h1>
            </div>
          ) : (
            <div className='players'>
              <h1>{currentGame.playerName}</h1>
              <h1>BOT</h1>
            </div>
          )
        ) : (
          opponentGame.playerName ? (
            <div>
              <h1>Adversaire trouvé: {opponentGame.playerName}</h1>
            </div>
          ) : (
            <div>
              <h1>Aucun adversaire...</h1>
            </div>
          )
        )}
        {(gameOver || gameOver === null) &&
          (player && player === localStorage.getItem("userID") ? (
            <RestartButton onRestart={onRestart} />
          ) : (
            <div></div>
          ))}
        {(leaver || gameOver) &&
          (!isViewer ? (
            gameOver.userId !== localStorage.getItem("userID") ? (
              <div className="game-over">Game Over</div>
            ) : (
              <div className="game-win">You Win</div>
            )
          ) : (!gameOver ? (<div className="game-win">Bot Win</div>)
            : (<div className="game-win">{gameOver.name} Win</div>)
          ))}
        {gameOver === null && (isViewer ? <div className="game-win">Bot Win</div> : <div className="game-over">Game Over</div>)}
        <div className="boards-container">
          <GameViewer
            grid={currentGame.grid}
            local={currentGame.playerId === localStorage.getItem('userID')}
            nextPiece={currentGame.nextPiece}
            isLeftPlayer={true}
          />
          <GameViewer
            grid={opponentGame.grid}
            local={opponentGame && opponentGame.playerId === localStorage.getItem('userID')}
            nextPiece={opponentGame.nextPiece}
            isLeftPlayer={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {localStorage.getItem("gameStarted") && localStorage.getItem("gameStarted") === roomId ?
        (
          <div className="home-container"><h1>Chargement ...</h1></div>
        ) : (
          <div>
            <h1>En attente...</h1>
            <p>Room ID : {roomId}</p>
            {player && player === localStorage.getItem("userID") && (
              <div>
                <h2>Mode de jeu</h2>
                <button onClick={() => onStartGame(0)}>Classique</button>
                <button onClick={() => onStartGame(1)}>Invisible</button>
              </div>
            )}
          </div>
        )
      }
    </div>
  );
};

export default GameMatchView;

// npm test -- --coverage test/views/GameOnline/GameMatchView.test.jsx --env=jsdom
