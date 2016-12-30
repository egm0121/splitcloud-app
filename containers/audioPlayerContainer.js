/**
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Slider,
  View,
  TouchableOpacity,
} from 'react-native';
import { ReactNativeAudioStreaming, Player, ReactNativeStreamingPlayer} from 'react-native-audio-streaming';
import SongPickerContainer from './songPickerContainer';


class AudioPlayerContainer extends Component {
  constructor(props){
    super(props);
    this._onPlayToggleOnePress = this._onPlayToggleOnePress.bind(this);
    this._onStopToggleOnePress = this._onStopToggleOnePress.bind(this);
    this._onPickerToggle = this._onPickerToggle.bind(this);
    this._onSongSelected = this._onSongSelected.bind(this);
    this._onVolumeValueChange = this._onVolumeValueChange.bind(this);

    this.playerAObj = new ReactNativeStreamingPlayer();

    this.state = {
      songPickerRequester:null,
      playSideA:false,
      playerATrack: {
        url: null
      },
      volume:100,
      userVolume:100,
      pan : this.props.pan,
      muted : this.props.muted
    };

    this.playerAObj.setPan(this.state.pan);
    this.playerAObj.setVolume(this.state.volume);

   console.log("player instance Id:",this.playerAObj._nativeInstanceId);
   this.playerAObj.getPan((err,pan) =>{
     console.log("player instance getPan():",pan);
   });
   this.playerAObj.getVolume((err,vol) =>{
     console.log("player  instance getVolume():",vol);
   });

  }
  _onSongSelected(rowData){
      this.setState({
        playerATrack: rowData,
        playSideA : false
      });
      this.playerAObj.stop();
      this.playerAObj.setSoundUrl(rowData.streamUrl);
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
  _onStopToggleOnePress(){
    if(this.state.playSideA){
      this.playerAObj.stop();
      this.setState({playSideA:false});
    }
  }
  _onPlayToggleOnePress(){
    //@TODO: refactor to use only internal state player from within getStatus callback
    if(this.state.playSideA){
      this.playerAObj.pause();
      this.setState({playSideA:false});
    } else {
      this.playerAObj.getStatus((err,playbackStatus) => {
        console.log('playerA status is ',playbackStatus)
        playbackStatus.status == "PAUSED" ?
        this.playerAObj.resume() :
        this.playerAObj.play();
      });
      this.setState({playSideA:true});
    }

  }
  _onVolumeValueChange(value) {
    const volume = Math.ceil(value*100);
    this.setState({
      volume: volume,
      userVolume: volume
    });
  }
  _onPlayerMuteChange(muted){
    if(muted){
      this.playerAObj.setVolume(0);
      this.playerAObj.isPlaying((isPlaying) => {
        if(isPlaying) this.playerAObj.pause();
      });
      this.setState({playSideA:false,muted:true});
    } else {
      this.setState({playSideA:false,muted:false});
      this.playerAObj.setVolume(this.state.userVolume);
    }
  }
  componentWillReceiveProps(newProps){
    this.setState({
      pan:newProps.pan,
      muted:newProps.muted
    });
  }
  componentDidUpdate(prevProps, prevState){
    if(prevState.volume !== this.state.volume && !this.state.muted){
      this.playerAObj.setVolume(this.state.volume);
    }
    if(prevState.pan !== this.state.pan){
      this.playerAObj.setPan(this.state.pan);
    }
    if(prevState.muted !== this.state.muted){
      this._onPlayerMuteChange(this.state.muted);
    }
  }
  render() {
    const trackLabelPlaceholder = 'No track selected - tap to load';
    return (
      <View style={styles.mainContainer}>
        <TouchableOpacity style={styles.container} onPress={this._onPickerToggle}>
          <Text style={styles.trackname}>
            {
              this.state.playerATrack.label ?
              this.state.playerATrack.label :
              trackLabelPlaceholder
            }
          </Text>
        </TouchableOpacity>
        <View style={styles.horizontalContainer}>
          <TouchableOpacity style={styles.container} onPress={this._onPlayToggleOnePress}>
            <Text style={styles.welcome}>
              {this.state.playSideA ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.container} onPress={this._onStopToggleOnePress}>
            <Text style={styles.welcome}>
              Stop
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.volumeSlider}>
          <Slider  onValueChange={this._onVolumeValueChange} value={this.state.volume} />
        </View>

      </View>
    );
  }
}
const volumeMarginSide = 40;
const styles = StyleSheet.create({
  mainContainer:{
    flex:1
  },
  container: {
    flex: 1,
    backgroundColor: '#F50',
  },
  horizontalContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F50',
  },
  volumeSlider:{
    marginLeft:volumeMarginSide,
    marginRight:volumeMarginSide,
    flex:1,
    alignItems: 'stretch',
    justifyContent: 'center'
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
  }
});
AudioPlayerContainer.propTypes = {

};
AppRegistry.registerComponent('AudioPlayerContainer', () => AudioPlayerContainer);

export default AudioPlayerContainer;
