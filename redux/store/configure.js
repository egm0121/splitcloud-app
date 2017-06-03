import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { AsyncStorage } from 'react-native'
import rootReducer from '../reducers/rootReducer';

const logger = store => {
  return next => {
    return action => {
      console.info('REDUX: action ->', action)
      let result = next(action)
      console.info('REDUX: state ->', store.getState())
      return result;
    }
  }
}
const createStoreWithDebug = withLog => {
  let enhancer = compose(autoRehydrate())
  let store = __DEV__ && withLog ?
    createStore(rootReducer,applyMiddleware(logger),enhancer) :
    createStore(rootReducer,undefined,enhancer);
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
