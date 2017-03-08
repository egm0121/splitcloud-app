import { createStore } from 'redux';
import appRootReducer from '../reducers/rootReducer';

let store = createStore(appRootReducer);

export default store;
