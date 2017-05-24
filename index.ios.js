/**
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Navigator,
  View
} from 'react-native';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose} from 'redux';
import { persistStore, autoRehydrate } from 'redux-persist';
import { AsyncStorage } from 'react-native'
import rootReducer from './redux/reducers/rootReducer';
import MainSceneContainer from './containers/mainSceneContainer';
import NotificationContainer from './containers/notificationContainer';

let store;
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
  return withLog ?
    createStore(rootReducer,applyMiddleware(logger),enhancer) :
    createStore(rootReducer,undefined,enhancer);
}

store = createStoreWithDebug(__DEV__ && true)

let persistor = persistStore(store, {
  blacklist: ['notifications'],
  storage: AsyncStorage
  }, () => {
  console.log('rehydration complete')
});

//persistor.purge();

class SplitCloudApp extends Component {
  constructor(props){
    super(props);
    this.configureScene = this.configureScene.bind(this);
  }

  configureScene(route, routeStack){
    return {
      ...Navigator.SceneConfigs.VerticalUpSwipeJump,
      gestures: {}, // or null
    };
  }
  render() {
    return (
        <Provider store={store} >
            <Navigator
                initialRoute={{ title: 'Initial screen', index: 0, component: MainSceneContainer }}
                renderScene={(route, navigator) => {
                  let Component = route.component;
                  return <View style={{flex: 1}}>
                          <Component title={route.title} navigator={navigator} {...route.passProps}/>
                          <NotificationContainer />
                        </View>
                }}
                configureScene={ this.configureScene }
              />
        </Provider>
    );
  }
}

AppRegistry.registerComponent('SplitCloudApp', () => SplitCloudApp);
