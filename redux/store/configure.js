/* global __DEV__ */
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { AsyncStorage } from 'react-native'
import rootReducer from '../reducers/rootReducer';
import devLogger from '../middleware/logger';
import analyticsMiddleware from '../middleware/analyticsEvents';
import tracksLocalCache from '../middleware/tracksLocalCache';

const createStoreWithDebug = withLog => {
  let enhancer = compose(autoRehydrate())
  let middlewareList = [analyticsMiddleware,tracksLocalCache];
  if(__DEV__ && withLog){
    middlewareList.push(devLogger);
  }
  let store = createStore(rootReducer,applyMiddleware(...middlewareList),enhancer);

  let persistor = persistStore(store, {
    blacklist: ['notifications'],
    storage: AsyncStorage
  }, () => console.log('rehydration complete'));
  return [store, persistor];
}
export let [store , persistor] = createStoreWithDebug(false);
export default store;
