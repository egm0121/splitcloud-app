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
    this.state = {playSideA:false, playSideB:false};
  }
  _onSideOnePress(){
    if(this.state.playSideA){
      ReactNativeAudioStreaming.destroywithKey(1);
      this.setState({playSideA:false});
    } else {
      ReactNativeAudioStreaming.play(songAssetOneUrl,1);
      this.setState({playSideA:true});
    }

  }
  _onSideTwoPress(){
    if(this.state.playSideB){
      ReactNativeAudioStreaming.stopwithKey(2);
      this.setState({playSideB:false});
    } else {
      ReactNativeAudioStreaming.play(songAssetTwoUrl,2);
      this.setState({playSideB:true});
    }

  }
  render() {
    return (
      <View style={styles.container}>

        <TouchableOpacity style={styles.container} onPress={this._onSideOnePress}>
          <Text style={styles.welcome}>
            {this.state.playSideA ? 'Stop' : 'Play'} side A
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.container} onPress={this._onSideTwoPress}>
          <Text style={styles.welcome}>
            {this.state.playSideB ? 'Stop' : 'Play'} side B
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
