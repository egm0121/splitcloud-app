/**
 * @flow
 */
/* global __DEV__ */
import React, { Component } from 'react';
import {
  AppRegistry,
  AppState,
  Navigator,
  StyleSheet,
  View,
  Text,
  PushNotificationIOS
} from 'react-native';
import './modules/Bugsnag';
import { Provider } from 'react-redux';
import { isIphoneX } from 'react-native-iphone-x-helper';
import PubNubReact from 'pubnub-react';
import MainSceneContainer from './containers/mainSceneContainer';
import NetworkAvailability from './components/networkAvailability';
import NotificationContainer from './containers/notificationContainer';
import SocialShareContainer from './containers/socialShareContainer';
import OfflineModeBanner from './components/offlineModeBanner';
import AnalyticsService from './modules/Analytics';
import NavigationStateNotifier from './modules/NavigationStateNotifier';
import SoundcloudPlaylist from './containers/soundcloudPlaylist';
import { store } from './redux/store/configure';
import Config from './helpers/config';
import THEME from './styles/variables';
import AdMobBottomBanner from './components/adMobBottomBanner';
import config from './helpers/config';


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

AnalyticsService.initialize(Config.GOOG_ANALYTICS_ID, 'SplitcloudApp');

if(!__DEV__){
  /* avoid any logging to prevent performance drops in prod mode */
  console.log = () => false;
  console.info = () => false;
  console.warn = () => false;
}

class SplitCloudApp extends Component {
  constructor(props){
    super(props);
    this.configureScene = this.configureScene.bind(this);
    this.onSceneDidFocus = this.onSceneDidFocus.bind(this);
    this.onSceneWillFocus = this.onSceneWillFocus.bind(this);
    this.setStylesGlobalOvverides();
    this.setupPushNotifications();
  }
  setupPushNotifications(){
    console.log('setting up PushNotifications');
    this.pubnub = new PubNubReact({
      publishKey: 'pub-c-85ae49d9-9ff5-4c48-964e-8007f6dcc1e5',
      subscribeKey: 'sub-c-f6e036c4-4db3-11e9-b0df-968893e54af3'
    });
    this.pubnub.init(this);
    PushNotificationIOS.requestPermissions();
    PushNotificationIOS.addEventListener('register',(token) => {
      console.log('GOT APNS deviceToken:',token);
      this.pubnub.push.addChannels(
        {
          channels: ['notifications',AnalyticsService.uniqueClientId],
          device: token,
          pushGateway: 'apns'
        });
    });
    PushNotificationIOS.addEventListener('notification', (notification) => {
      console.log('Received notification while running!',notification);
      if(AppState.currentState !== 'active'){
        this.handlePushNotification(notification);
      }
    });
    PushNotificationIOS.getInitialNotification().then(notification => {
      console.log('app resumed with notification', notification);
      if(notification) this.handlePushNotification(notification);
    })
  }
  handlePushNotification(notification){
    const payload = notification.getData().appData;
    if (payload && payload.componentName === 'SoundcloudPlaylist') {
      const { playlist } = payload;
      const activeMode = this.getActivePlaybackMode(store);
      const activeSide = activeMode !== 'S' ? activeMode : 'L';
      console.log('trigger playlist screen with props', { playlist, side:activeSide });
      this.navigator.push({
        title : `SoundcloudPlaylist - ${playlist.label} - ${activeSide}`,
        name : 'SoundcloudPlaylist' + activeSide,
        component: SoundcloudPlaylist,
        passProps : {
          playlist,
          side : activeSide,
          onClose: () => this.navigator.pop()
        }
      });
    }
  }
  setStylesGlobalOvverides(){
    Text.defaultProps.allowFontScaling = false;
  }
  configureScene(route, routeStack){
    return {
      ...Navigator.SceneConfigs.PushFromRight,
      gestures: {}, // or null
    };
  }
  onSceneDidFocus(route){
    console.log('new scene did focus:',route);
    NavigationStateNotifier.onSceneDidFocus(route);
  }
  onSceneWillFocus(route){
    console.log('new scene will focus:',route);
    let screenName = route.title;
    if( this.isMainPlayerScreen(route) ){
      screenName += ' | mode: ' + this.getActivePlaybackMode(store);  
    }
    AnalyticsService.sendScreenView( screenName || 'Unknown Screen');
  }
  isMainPlayerScreen(route){
    return route.name == 'MainSceneContainer';
  }
  getActivePlaybackMode(store){
    return store.getState().mode;
  }
  render() {
    return (
        <Provider store={store} >
            <Navigator
                initialRoute={{ 
                  title: 'MainSceneContainer', 
                  name:'MainSceneContainer',
                  index: 0, 
                  component: MainSceneContainer
                }}
                onDidFocus={this.onSceneDidFocus}
                onWillFocus={this.onSceneWillFocus}
                ref={(navigator)=> {this.navigator = navigator;}}
                renderScene={(route, navigator) => {
                  let Component = route.component;
                  return <NetworkAvailability>{
                        (isOnline,networkType) => {
                          const fullScreenPlayerScene = route.name == 'MainSceneContainer' ? [styles.fullScreenPlayer] :null;
                          return <View style={[styles.rootContainerView,fullScreenPlayerScene]}>
                              <Component title={route.title} 
                                isOnline={isOnline} 
                                networkType={networkType} 
                                routeName={route.name} 
                                navigator={navigator} 
                                {...route.passProps}/>
                              <NotificationContainer />
                              <SocialShareContainer navigator={navigator} />
                              <OfflineModeBanner isOnline={isOnline} />
                              <AdMobBottomBanner adDisabled={config.AD_DISABLED} />
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
    backgroundColor:THEME.mainBgColor,
    paddingTop: isIphoneX() ? 40 : 20
  },
  fullScreenPlayer: {
    paddingTop: 0
  }
})
AppRegistry.registerComponent('SplitCloudApp', () => SplitCloudApp);
