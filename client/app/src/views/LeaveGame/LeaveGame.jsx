import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import SocketService from '../../services/SocketService';


const LeaveGame = () => {
  const { currentPage, previousPage } = useSelector((state) => state.navigation);

  useEffect(() => {
    if (previousPage !== null && currentPage !== previousPage && localStorage.getItem('gameStarted')) {
      localStorage.removeItem("gameStarted");
    }
    if (currentPage !== previousPage 
        && !currentPage.includes(localStorage.getItem("roomId"))
    ) {
        SocketService.leaveGame(localStorage.getItem("roomId"), localStorage.getItem("userID"))
        localStorage.removeItem("roomId");
    }
  }, [currentPage, previousPage]);

  return null;
};

export default LeaveGame;

// npm test -- --coverage test/views/LeaveGame/LeaveGame.test.jsx --env=jsdom