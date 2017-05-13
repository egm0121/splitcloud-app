/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Navigator
} from 'react-native';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './redux/reducers/rootReducer';
import MainSceneContainer from './containers/mainSceneContainer';


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
  return withLog ?
    createStore(rootReducer,applyMiddleware(logger)) :
    createStore(rootReducer);
}

store = createStoreWithDebug(__DEV__ && false)

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
                return  <Component title={route.title} navigator={navigator} {...route.passProps}/>

            }}
            configureScene={ this.configureScene }
          />
        </Provider>
    );
  }
}

AppRegistry.registerComponent('SplitCloudApp', () => SplitCloudApp);
