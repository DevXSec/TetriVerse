import PlayerName from '../Player/PlayerName';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import SocketService from '../../services/SocketService';

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const savedUserId = localStorage.getItem("userID") || "";
    if (savedUserId !== "") {
      SocketService.checkUserID(savedUserId);
      SocketService.socket.on("userExists", (res) => {
        if (res !== null) {
          setUsername(res.name);
          localStorage.setItem('username', res.name);
          setShowButton(true);
        }
      })
    } else if (localStorage.getItem('userID') && localStorage.getItem('username')) {
      setShowButton(true);
    }

    SocketService.socket.on("usernameInUse", (message) => {
      setErrorMessage(message);
    });

    SocketService.socket.on("usernameAccepted", () => {
      setShowButton(true);
      setErrorMessage("");
    });

    return () => {
      SocketService.socket.off("usernameInUse");
    };
  }, []);

  const handleConfirmation = (login) => {
    SocketService.connect && SocketService.connect(null, login, null);
    setUsername(login);
    window.location.reload();
  };

  return (
    <div className="home-container">
      <h1>Bienvenue sur Tetris Online {username}</h1>
      {
        showButton ?
        <div>
          <p>Choisissez un mode de jeu :</p>
          <div className='buttons'>
            <div className="play-buttons">
              <button onClick={() => navigate('/solo')}>Jouer en solo</button>
              <button onClick={() => navigate('/online')}>Jouer en ligne</button>
            </div>
            <div className="other-buttons">
              <button onClick={() => navigate('/leaderboard')}>Classement</button>
            </div>
          </div>
        </div> : <div>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          <PlayerName onConfirm={handleConfirmation}/>
        </div>
      }
    </div>
  );
};

export default Home;

// npm test -- --coverage test/views/Home/Home.test.jsx --env=jsdom