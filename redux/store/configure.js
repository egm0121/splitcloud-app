/* global __DEV__ */
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import createMigration from 'redux-persist-migrate';
import { AsyncStorage } from 'react-native'
import rootReducer from '../reducers/rootReducer';
import devLogger from '../middleware/logger';
import analyticsMiddleware from '../middleware/analyticsEvents';
import tracksLocalCache from '../middleware/tracksLocalCache';
import {VERSION_REDUCER_KEY} from '../../helpers/constants';

const createStoreWithDebug = withLog => {
  let middlewareList = [analyticsMiddleware,tracksLocalCache];
  if(__DEV__ && withLog){
    middlewareList.push(devLogger);
  }

  const manifest = {
    1: (state) => ({...state}),
    2: (state) => {
      if(!state || !state.players) return state;
      let toState =  {...state};
      toState.players = toState.players.map(
        player => ({...player,inverted: false})
      );
      return toState;
    },
  };

  const migration = createMigration(manifest, VERSION_REDUCER_KEY)
  let enhancer = compose(autoRehydrate(),migration);
  let store = createStore(rootReducer,applyMiddleware(...middlewareList),enhancer);

  let persistor = persistStore(store, {
    blacklist: ['notifications'],
    storage: AsyncStorage
  }, () => console.log('rehydration complete'));
  return [store, persistor];
}
export let [store , persistor] = createStoreWithDebug(true);
export default store;
