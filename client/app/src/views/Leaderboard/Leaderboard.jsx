import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import SocketService from '../../services/SocketService';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("userID") || !localStorage.getItem("username")) {
        navigate(`/`);
    }
    SocketService.leaderBoard && SocketService.leaderBoard();
  }, []);

  useEffect(() => {
    const handleLeaderboardInfos = ({ infos }) => {
        setBoard(infos)
    };

    SocketService.socket.on('leaderboardInfos', handleLeaderboardInfos);

    return () => {
        SocketService.socket.off('leaderboardInfos', handleLeaderboardInfos);
    };
  }, [board]);

  return (
    <div className="leaderboard-container">
        {board.length > 0 ? (
            <div className='leader-display'>
                <h1 className='title'>Classement</h1>
                <div className="leaderboard-table">
                    <div className="leaderboard-header">
                        <div className="leaderboard-column">#</div>
                        <div className="leaderboard-column">Nom</div>
                        <div className="leaderboard-column">Score</div>
                    </div>
                    <div className="row-table">
                        {board.map((player, i) => (
                            <div key={i} className='leaderboard-row'>
                                <div className="leaderboard-column">{i + 1}</div>
                                <div className="leaderboard-column">
                                    {player.userId === localStorage.getItem('userID') ? (
                                        <span className="highlight-text">Moi</span>
                                    ) : (
                                        player.name
                                    )}
                                </div>
                                <div className="leaderboard-column">{player.bestScore}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ) : (
            <div className="no-data-message">
                <h3>Personne dans le leaderboard. Faites une game en solo pour le mettre à jour!</h3>
            </div>
        )}
    </div>
  );
};

export default Leaderboard;

// npm test -- --coverage test/views/Leaderboard/Leaderboard.test.jsx --env=jsdom
