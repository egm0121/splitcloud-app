/**
 * @flow
 */
/* global __DEV__ */
import React, { Component } from 'react';
import {
  AppRegistry,
  Navigator,
  View
} from 'react-native';
import { Provider } from 'react-redux';
import MainSceneContainer from './containers/mainSceneContainer';
import NotificationContainer from './containers/notificationContainer';
import AnalyticsService from './modules/analyticsService';
import { store } from './redux/store/configure';

AnalyticsService.initialize('UA-100899493-2','SplitcloudApp');

if(!__DEV__){
  /* avoid any logging to prevent performance drops in prod mode */
  console.log = () => {};
}

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
                initialRoute={{ title: 'MainSceneContainer', index: 0, component: MainSceneContainer }}
                renderScene={(route, navigator) => {

                  AnalyticsService.sendScreenView(route.title || 'Component');

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
