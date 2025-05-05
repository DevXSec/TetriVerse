import React from 'react';

const GameMenuView = ({ roomId, waiting, onJoinGame, onCreateGame, errorMessage }) => {
  return (
    <div className='home-container'>
      <h1>Mode Online</h1>

      {errorMessage && <h3 className="error-message">{errorMessage}</h3>}

      {!roomId ? (
        <div>
          <button onClick={onJoinGame}>Rejoindre une Partie</button>
          <button onClick={onCreateGame}>Créer une Partie</button>
        </div>
      ) : waiting ? (
        <div>En attente...</div>
      ) : (
        <p>🎮 Partie en cours : {roomId}</p>
      )}
    </div>
  );
};

export default GameMenuView;

// npm test -- --coverage test/views/GameOnline/GameMenuView.test.jsx --env=jsdom
