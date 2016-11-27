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
  TextInput,
  ListView,
  View,
  TouchableOpacity,
  Navigator
} from 'react-native';
import { ReactNativeAudioStreaming, Player } from 'react-native-audio-streaming';
import SongPicker from './components/songPicker';


class SplitCloudApp extends Component {
  constructor(){
    super();
    this._onSideOnePress = this._onSideOnePress.bind(this);
    this._onSideTwoPress = this._onSideTwoPress.bind(this);
    this._onSongSelected = this._onSongSelected.bind(this);

    this.state = {
      songPickerRequester:null,
      isSongPickerVisible:false,
      playSideA:false,
      playSideB:false,
      playerATrack: {
        url: null
      },
      playerBTrack: {
        url: null
      }
    };
  }

  _onSongSelected(rowData){
    if(this.state.songPickerRequester == 'A') {
      this.setState({
        playerATrack: rowData,
        playSideA : false
      });
      ReactNativeAudioStreaming.stopwithKey(1);
    } else {
      this.setState({
        playerBTrack : rowData,
        playSideB : false
      });
      ReactNativeAudioStreaming.stopwithKey(2);
    }

  }
  _onPickerToggle(activeSide){
    this.setState({
      songPickerRequester : activeSide,
      isSongPickerVisible : true
    });
  }
  _onSongPickerClose(){
    this.setState({
      songPickerRequester : false,
      isSongPickerVisible : false
    });
  }
  _onSideOnePress(){
    if(this.state.playSideA){
      ReactNativeAudioStreaming.stopwithKey(1);
      this.setState({playSideA:false});
    } else {
      ReactNativeAudioStreaming.createPlayer(1);
      ReactNativeAudioStreaming.setPan(1,-1);
      ReactNativeAudioStreaming.playUrl(this.state.playerATrack.streamUrl,1);
      this.setState({playSideA:true});
    }

  }
  _onSideTwoPress(){
    if(this.state.playSideB){
      ReactNativeAudioStreaming.stopwithKey(2);
      this.setState({playSideB:false});
    } else {
      ReactNativeAudioStreaming.createPlayer(2);
      ReactNativeAudioStreaming.setPan(2,1);
      ReactNativeAudioStreaming.playUrl(this.state.playerBTrack.streamUrl,2);
      this.setState({playSideB:true});
    }

  }


  render() {
    let songPickerVisible = {
      display: this.state.isSongPickerVisible ? 'flex' : 'none'
    };
    return (
      <View style={styles.container}>
        <SongPicker style={songPickerVisible}
          onSongSelected={this._onSongSelected.bind(this)}
          onClose={this._onSongPickerClose.bind(this)} />
        <Text style={styles.header}>
           SplitCloud
        </Text>
        <Text style={styles.welcome}>{this.state.playerATrack.label}</Text>
        <TouchableOpacity style={styles.container} onPress={this._onSideOnePress}>
          <Text style={styles.welcome}>
            {this.state.playSideA ? 'Stop' : 'Play'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.container} onPress={this._onPickerToggle.bind(this,'A')}>
          <Text>Load Song</Text>
        </TouchableOpacity>
        <Text style={styles.welcome}>{this.state.playerBTrack.label}</Text>
        <TouchableOpacity style={styles.container} onPress={this._onSideTwoPress}>
          <Text style={styles.welcome}>
            {this.state.playSideB ? 'Stop' : 'Play'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.container} onPress={this._onPickerToggle.bind(this,'B')}>
          <Text>Load Song</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F50'
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    margin: 10,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FFFFFF',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  }
});

AppRegistry.registerComponent('SplitCloudApp', () => SplitCloudApp);
