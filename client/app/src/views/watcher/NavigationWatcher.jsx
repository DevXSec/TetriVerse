import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SocketService from "../../services/SocketService";

const NavigationWatcher = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentPage } = useSelector(state => state.navigation);

  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch({ type: 'PAGE_CLOSED', payload: location.pathname });

      if (localStorage.getItem('gameStarted')) {
        localStorage.removeItem("gameStarted");
      }
      if (localStorage.getItem("roomId")) {
        SocketService.leaveGame && SocketService.leaveGame(localStorage.getItem("roomId"), localStorage.getItem("userID"))
        localStorage.removeItem("roomId");
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dispatch, location]);

  useEffect(() => {
    if (currentPage !== location.pathname) {
      dispatch({ type: 'PAGE_CHANGE', payload: location.pathname });
    }
  }, [location, dispatch, currentPage]);

  return null;
};

export default NavigationWatcher;

// npm test -- --coverage test/views/watcher/NavigationWatcher.test.jsx --env=jsdom
