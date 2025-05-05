const initialState = {
    closedFrom: null,
    previousPage: null,
    currentPage: window.location.pathname,
  };
  
  function navigationReducer(state = initialState, action) {
    switch (action.type) {
      case 'PAGE_CLOSED':
        return {
          ...state,
          closedFrom: action.payload,
        };
      case 'PAGE_CHANGE':
        return {
          previousPage: state.currentPage,
          currentPage: action.payload,
        };
      default:
        return state;
    }
  }
  
  export default navigationReducer;

// npm test -- --coverage test/services/navigationReducer.test.jsx --env=jsdom
