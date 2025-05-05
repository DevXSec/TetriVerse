import Home from './views/Home/Home';
import React, { useEffect } from 'react';
import ErrorPage from './views/Error/Error';
import { FaMoon, FaSun } from 'react-icons/fa';
import GameSolo from "./views/GameSolo/GameSolo";
import LeaveGame from './views/LeaveGame/LeaveGame';
import { useTheme } from './views/Theme/ThemeContext';
import Leaderboard from './views/Leaderboard/Leaderboard';
import GameMenuContainer from './containers/GameMenuContainer';
import GameMatchContainer from './containers/GameMatchContainer';
import NavigationWatcher from './views/watcher/NavigationWatcher';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App = () => {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <Router>
      <NavigationWatcher />
      <button 
        className="theme-toggle-btn" 
        onClick={toggleTheme} 
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <FaSun size={24} /> : <FaMoon size={24} />}
      </button>
      <LeaveGame />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/solo" element={<GameSolo />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/online" element={<GameMenuContainer />} />
        <Route path="/:roomId/:username" element={<GameMatchContainer />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
};

export default App;
