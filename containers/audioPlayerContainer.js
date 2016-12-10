/**
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
} from 'react-native';
import { ReactNativeAudioStreaming, Player } from 'react-native-audio-streaming';
import SongPickerContainer from './songPickerContainer';


class AudioPlayerContainer extends Component {
  constructor(){
    super();
    this._onSideOnePress = this._onSideOnePress.bind(this);
    this._onSideTwoPress = this._onSideTwoPress.bind(this);
    this._onSongSelected = this._onSongSelected.bind(this);

    this.state = {
      songPickerRequester:null,
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
      songPickerRequester : activeSide
    });
    this.props.navigator.push({
      component: SongPickerContainer,
      passProps : {
        activeSide,
        onClose: () => { this.props.navigator.pop() },
        onSongSelected : (rowData) => {
          console.log('got song selected',rowData);
          this.props.navigator.pop();
          this._onSongSelected(rowData);
        }
      }
    });
  }
  _onSongPickerClose(){
    this.setState({
      songPickerRequester : false
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
        <Text style={styles.header}>
           SplitCloud
        </Text>
        <Text style={styles.trackname}>{this.state.playerATrack.label}</Text>
        <TouchableOpacity style={styles.container} onPress={this._onSideOnePress}>
          <Text style={styles.welcome}>
            {this.state.playSideA ? 'Stop' : 'Play'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.container} onPress={this._onPickerToggle.bind(this,'A')}>
          <Text>Load Song</Text>
        </TouchableOpacity>
        <Text style={styles.trackname}>{this.state.playerBTrack.label}</Text>
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
    backgroundColor: '#F50',
    paddingTop: 20
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
  trackname : {
    fontSize: 16,
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

AppRegistry.registerComponent('AudioPlayerContainer', () => AudioPlayerContainer);

export default AudioPlayerContainer;
