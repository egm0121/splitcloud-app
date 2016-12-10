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

import AudioPlayerContainer from './containers/audioPlayerContainer';

class SplitCloudApp extends Component {
  constructor(){
    super();
    this.configureScene = this.configureScene.bind(this);
  }
  configureScene(route, routeStack){
    return Navigator.SceneConfigs.VerticalUpSwipeJump ;
  }
  render() {
    return ( <Navigator
        initialRoute={{ title: 'Initial screen', index: 0, component: AudioPlayerContainer }}
        renderScene={(route, navigator) =>{
          let Component = route.component;
            return <Component title={route.title} navigator={navigator} {...route.passProps} />
        }}
        configureScene={ this.configureScene }
      />
    );
  }
}

AppRegistry.registerComponent('SplitCloudApp', () => SplitCloudApp);
