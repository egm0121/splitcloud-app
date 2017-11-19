/**
 * @flow
 */
/* global __DEV__ */
import React, { Component } from 'react';
import {
  AppRegistry,
  Navigator,
  StyleSheet,
  View
} from 'react-native';
import { Provider } from 'react-redux';
import MainSceneContainer from './containers/mainSceneContainer';
import NetworkAvailability from './components/networkAvailability';
import NotificationContainer from './containers/notificationContainer';
import OfflineModeBanner from './components/offlineModeBanner';
import AnalyticsService from './modules/analyticsService';
import { store } from './redux/store/configure';
import Config from './helpers/config';
//decorate navigator to add a method to push at the bottom of the routeStack
Navigator.prototype.pushToBottom = function (route) {
  var activeStack = this.state.routeStack;
  var activeAnimationConfigStack = this.state.sceneConfigStack;
  var nextStack = activeStack.concat([route]);
  var destIndex = nextStack.length - 1;
  var nextAnimationConfigStack = activeAnimationConfigStack.concat([
    this.props.configureScene(route),
  ]);
  this._emitWillFocus(nextStack[destIndex]);
  this.setState({
    routeStack: nextStack,
    sceneConfigStack: nextAnimationConfigStack,
  }, () => {
    this._enableScene(destIndex);
    this._transitionTo(destIndex);
  });
};

AnalyticsService.initialize(Config.GOOG_ANALYTICS_ID,'SplitcloudApp');

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
      ...Navigator.SceneConfigs.PushFromRight,
      gestures: {}, // or null
    };
  }
  render() {
    return (
        <Provider store={store} >
            <Navigator
                initialRoute={{ title: 'MainSceneContainer',name:'MainSceneContainer', index: 0, component: MainSceneContainer }}
                renderScene={(route, navigator) => {
                  AnalyticsService.sendScreenView(route.title || 'Component');
                  let Component = route.component;
                  return <NetworkAvailability>{
                        (isOnline,networkType) => {

                          return <View style={styles.rootContainerView}>
                            <Component title={route.title} isOnline={isOnline} networkType={networkType} routeName={route.name} navigator={navigator} {...route.passProps}/>
                            <NotificationContainer />
                            <OfflineModeBanner isOnline={isOnline} />
                          </View>
                        }
                  }</NetworkAvailability>
                }}
                configureScene={ this.configureScene }
              />
        </Provider>
    );
  }
}
const styles = StyleSheet.create({
  rootContainerView:{
    flex: 1,
    backgroundColor:'black'
  }
})
AppRegistry.registerComponent('SplitCloudApp', () => SplitCloudApp);
