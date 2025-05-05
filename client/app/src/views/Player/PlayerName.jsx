import React from 'react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SocketService from '../../services/SocketService';

const PlayerName = ({ onConfirm }) => {
    const [username, setUsername] = useState('');

    const sendUsername = () => {
        if (username.trim()) {
            SocketService.connect(uuidv4(), username);
            onConfirm(username);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendUsername();
        }
    };

    return (
        <div className="username">
            <input
                type="text"
                placeholder="Entrez votre pseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button onClick={sendUsername}>Confirmer</button>
        </div>
    )
};

export default PlayerName;

// npm test -- --coverage test/views/Player/PlayerName.test.jsx --env=jsdom
