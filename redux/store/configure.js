/* global __DEV__ */
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { AsyncStorage } from 'react-native'
import rootReducer from '../reducers/rootReducer';
import devLogger from '../middleware/logger';
import analyticsMiddleware from '../middleware/analyticsEvents';

const createStoreWithDebug = withLog => {
  let enhancer = compose(autoRehydrate())
  let store = __DEV__ && withLog ?
    createStore(rootReducer,applyMiddleware(analyticsMiddleware,devLogger),enhancer) :
    createStore(rootReducer,applyMiddleware(analyticsMiddleware),enhancer);
  let persistor = persistStore(store, {
    blacklist: ['notifications'],
    storage: AsyncStorage
  }, () => {
    console.log('rehydration complete')
  });
  return [store, persistor];
}
export let [store , persistor] = createStoreWithDebug(false);
export default store;
