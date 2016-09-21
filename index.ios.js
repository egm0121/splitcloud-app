/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import { ReactNativeAudioStreaming, Player } from 'react-native-audio-streaming';


const songAssetOneUrl = 'http://egm0121-split-cloud.herokuapp.com/asset/booba_scarface.mp3';
const songAssetTwoUrl = 'http://egm0121-split-cloud.herokuapp.com/asset/kaaris_charge.mp3';

class Example extends Component {
  constructor(){
    super();
    this._onSideOnePress = this._onSideOnePress.bind(this);
    this._onSideTwoPress = this._onSideTwoPress.bind(this);
    this.state = {play:false};
  }
  _onSideOnePress(){
    if(this.state.play){
      ReactNativeAudioStreaming.stop();
      this.setState({play:false});
    } else {
      ReactNativeAudioStreaming.play(songAssetOneUrl);
      this.setState({play:true});
    }

  }
  _onSideTwoPress(){
    if(this.state.play){
      ReactNativeAudioStreaming.stop();
      this.setState({play:false});
    } else {
      ReactNativeAudioStreaming.play(songAssetTwoUrl);
      this.setState({play:true});
    }

  }
  render() {
    return (
      <View style={styles.container}>
      
        <TouchableOpacity style={styles.container} onPress={this._onSideOnePress}>
          <Text style={styles.welcome}>
            toggle song one
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.container} onPress={this._onSideTwoPress}>
          <Text style={styles.welcome}>
            toggle song two
          </Text>
        </TouchableOpacity>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>



      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('Example', () => Example);
