import { createStore, combineReducers } from 'redux';
import navigationReducer from './navigationReducer';

const rootReducer = combineReducers({
  navigation: navigationReducer,
});

const store = createStore(rootReducer);

export default store;

// npm test -- --coverage test/services/store.test.jsx --env=jsdom