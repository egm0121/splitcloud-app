/* global __DEV__ */
import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import createMigration from 'redux-persist-migrate';
import { AsyncStorage } from 'react-native'
import rootReducer from '../reducers/rootReducer';
import devLogger from '../middleware/logger';
import analyticsMiddleware from '../middleware/analyticsEvents';
import tracksLocalCache from '../middleware/tracksLocalCache';
import storeReviewRequestorMiddleware from '../middleware/storeReviewRequestor';
import migrations from './migrations';
import {VERSION_REDUCER_KEY} from '../../helpers/constants';

const createStoreWithDebug = withLog => {
  let middlewareList = [
    analyticsMiddleware,
    tracksLocalCache,
    storeReviewRequestorMiddleware
  ];
  if(__DEV__ && withLog){
    middlewareList.push(devLogger);
  }
  const migration = createMigration(migrations, VERSION_REDUCER_KEY)
  let enhancer = compose(migration,autoRehydrate());
  let store = createStore(rootReducer,applyMiddleware(...middlewareList),enhancer);

  let persistor = persistStore(store, {
    blacklist: ['notifications','playbackStatus','preview'],
    storage: AsyncStorage
  }, () => console.log('rehydration complete'));
  return [store, persistor];
}
export let [store , persistor] = createStoreWithDebug(true);
export default store;
