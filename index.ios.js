/**
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Navigator,
  View
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Provider } from 'react-redux';
import MainSceneContainer from './containers/mainSceneContainer';
import NotificationContainer from './containers/notificationContainer';
import {
  Analytics,
  Hits as GAHits
} from 'react-native-google-analytics';
import { store } from './redux/store/configure';

class SplitCloudApp extends Component {
  constructor(props){
    super(props);
    this.configureScene = this.configureScene.bind(this);
    let clientId = DeviceInfo.getUniqueID();
    this.googTracker = new Analytics('UA-100899493-2', clientId, 1, DeviceInfo.getUserAgent());
    console.log('device info',DeviceInfo.getUserAgent(),'uniqueId',clientId );
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
                  var screenView = new GAHits.ScreenView(
                       'SplitcloudApp',
                       route.component.displayName,
                       DeviceInfo.getReadableVersion(),
                       DeviceInfo.getBundleId()
                     );
                  this.googTracker.send(screenView);
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
