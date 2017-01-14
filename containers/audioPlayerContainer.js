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
  Dimensions
} from 'react-native';
import { ReactNativeAudioStreaming, Player, ReactNativeStreamingPlayer} from 'react-native-audio-streaming';
import SongPickerContainer from './songPickerContainer';
import MultiSlider from 'react-native-multi-slider';

const PROGRESS_TICK_INTERVAL = 1000;
const capitalize = (str) => str[0].toUpperCase() + str.substring(1).toLowerCase();
class AudioPlayerContainer extends Component {
  constructor(props){
    super(props);
    this._onPlayToggleOnePress = this._onPlayToggleOnePress.bind(this);
    this._onStopToggleOnePress = this._onStopToggleOnePress.bind(this);
    this._onPickerToggle = this._onPickerToggle.bind(this);
    this._onSongSelected = this._onSongSelected.bind(this);
    this._onVolumeValueChange = this._onVolumeValueChange.bind(this);
    this._onMultiSliderValuesChange = this._onMultiSliderValuesChange.bind(this);
    this._onSeekToTime = this._onSeekToTime.bind(this);
    this._onProgressTick = this._onProgressTick.bind(this);
    this._goToNextTrack = this._goToNextTrack.bind(this);
    this._goToPrevTrack = this._goToPrevTrack.bind(this);

    this.playerAObj = new ReactNativeStreamingPlayer();

    this.state = {
      songPickerRequester:null,
      playerATrack: {
        url: null
      },
      currTrackIndex:0,
      playlist:[],
      volume:100,
      userVolume:100,
      elapsed:0,
      duration:0,
      status:false,
      initialSliderValue:100,
      sliderOneValue:[1],
      pan : this.props.pan,
      muted : this.props.muted
    };

    this.playerAObj.setPan(this.state.pan);
    this.playerAObj.setVolume(this._linearToLogVolume(this.state.volume));
    this.playbackProgressRef = setTimeout(this._onProgressTick,PROGRESS_TICK_INTERVAL);
    console.log("player instance Id:",this.playerAObj._nativeInstanceId);

    this.playerAObj.on('AudioBridgeEvent',(evt) => {
      const actionName = evt.status.toLowerCase(),
            hookName = '_onPlayer'+capitalize(actionName);
      if(typeof this[hookName] === 'function' ){
        this[hookName](...[evt]);
      }
    });
  }
  _onProgressTick(){
    this.playerAObj.getStatus((err,data) => {
      let progres = parseFloat(data.progress);
      let duration = parseFloat(data.duration);
      let currProgress = parseInt( (data.progress * 100) / data.duration ) || 0;
      this.setState({
          duration : data.duration,
          elapsed: data.progress,
          sliderOneValue:[currProgress],
          status : data.status
        });
    });

    this.playbackProgressRef = setTimeout(
      this._onProgressTick,PROGRESS_TICK_INTERVAL
    );
  }
  _onPlayerStopped(evt){
    console.log('_onPlayerStopped',evt);

  }
  _onSongSelected(rowData){
      this.setState({
        playlist:[rowData]
      });
  }
  _goToNextTrack(){

    if( this.state.currTrackIndex === (this.state.playlist.length -1) ){
       return this.setState({
         currTrackIndex : 0
       });
    }
    this.setState({
      currTrackIndex : this.state.currTrackIndex + 1
    });
  }
  _goToPrevTrack(){
    if(this.state.currTrackIndex === 0){
       return this.setState({
         currTrackIndex : 0
       });
    }
    this.setState({
      currTrackIndex : this.state.currTrackIndex - 1
    })
  }
  _prepareCurrentTrack(){
    let currentTrack = this._getCurrentTrackStream();
    console.log('_prepareCurrentTrack',currentTrack);
    if( !currentTrack )return;
    this.playerAObj.isPlaying((err,isPlaying) => {
      if(isPlaying) {
        console.log('pause and set url to next')
        this.playerAObj.pause();
      }
      console.log('setSoundUrl and play')
      this.playerAObj.setSoundUrl(currentTrack);
      this.playerAObj.play();
    });
  }
  _onStopToggleOnePress(){
    this.playerAObj.stop();
  }
  _onPlayToggleOnePress(){
      this.playerAObj.getStatus((err,playbackStatus) => {
        if(playbackStatus.status === "PLAYING"){
          this.playerAObj.pause();
        }
        if(playbackStatus.status === "PAUSED" ){
          this.playerAObj.resume()
        }
        if(playbackStatus.status === "STOPPED"){
          this.playerAObj.play();
        }
      });
  }
  _onSongQueued(nextTrack){
    this.setState({
      playlist : [...this.state.playlist,nextTrack]
    });
  }
  _onPickerToggle(activeSide){
    this.props.navigator.push({
      component: SongPickerContainer,
      passProps : {
        activeSide,
        onClose: () => { this.props.navigator.pop() },
        onSongSelected : (nextTrack) => {
          console.log('got song selected',nextTrack);
          this.props.navigator.pop();
          this._onSongSelected(nextTrack);
        },
        onSongQueued : (nextTrack) => {
          console.log('songQueued');
          this.props.navigator.pop();
          this._onSongQueued(nextTrack);
        }
      }
    });
  }
  _onSongPickerClose(){

  }
  _onMultiSliderValuesChange(values){
    console.log('_onMultiSliderValuesChange')
  }
  _onSeekToTime(newPos){
    let seekedPos = (parseInt(newPos[0]) * this.state.duration) / 100;
    this.playerAObj.seekToTime(seekedPos);
  }
  _onVolumeValueChange(value) {
    const volume = this._linearToLogVolume(value);
    console.log('increment volume : slider',value,'volume', volume);
    this.setState({
      volume: volume,
      userVolume: volume
    });
  }
  _linearToLogVolume(currVolume){
    currVolume = currVolume * 5;
    const maxVolume = 5;
    const logVol = (1 - (Math.log(maxVolume-currVolume)/Math.log(maxVolume))) * 5;

    return (logVol < maxVolume ? parseFloat(logVol) : 5) ;
  }
  _onPlayerMuteChange(muted){
    if(muted){
      this.playerAObj.setVolume(this._linearToLogVolume(0));
      this.playerAObj.isPlaying((isPlaying) => {
        if(isPlaying) this.playerAObj.pause();
      });
      this.setState({muted:true});
    } else {
      this.setState({muted:false});
      this.playerAObj.setVolume(this._linearToLogVolume(this.state.userVolume));
    }
  }
  _formatAsMinutes(seconds){
    let min = Math.floor(seconds / 60),
        leftSeconds = seconds - (min * 60),
        pInt = (float) => parseInt(float,10),
        pad = (int) => int < 10 ? `0${pInt(int)}` : `${pInt(int)}`;
    return `${pad(min)}:${pad(leftSeconds)}`;
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
    if(prevState.playlist !== this.state.playlist){
      console.log('playlist updated:',this.state.playlist);
    }
    if(prevState.playlist[prevState.currTrackIndex] !==
       this.state.playlist[this.state.currTrackIndex]){
      console.log('current playing track changed: prepare to play');
      this._prepareCurrentTrack();
    }
  }
  componentWillUnmount(){
    console.log("component will unmount! destory player instance")
    if(this.playerAObj){
       this.playerAObj.stop();
       this.playerAObj.destroy();
    }
  }
  _getCurrentTrackIndex(){
    return this.state.currTrackIndex;
  }
  _getCurrentTrackObj(){
    return this.state.playlist[this.state.currTrackIndex] || {};
  }
  _getCurrentTrackStream(){
    return this._getCurrentTrackObj().streamUrl;
  }
  _getCurrentTrackTitle() {
    return this._getCurrentTrackObj().label;
  }
  _isPlayerBuffering(){
    return this.state.status === 'BUFFERING';
  }
  _isPlayerPlaying(){
    return this.state.status === 'PLAYING';
  }
  _isPlayerPaused(){
    return this.state.status === 'PAUSED';
  }
  _isPlayerStopped(){
    return this.state.status === 'STOPPED';
  }
  render() {
    const sideLabel = {
      'L' : 'left',
      'R' : 'right'
    };
    const isBufferingLabel = 'Buffering - ';
    const playbackStateLabel =
      this._isPlayerPlaying() || this._isPlayerBuffering() ? 'Pause' : 'Play';

    let {height, width} = Dimensions.get('window');
    let progressTrackLength = width - 120;
    let trackIndex = this._getCurrentTrackIndex();
    let trackLabelPlaceholder = 'Tap to load ' + sideLabel[this.props.side] + ' track...';
    if(this._getCurrentTrackTitle() ){
        trackLabelPlaceholder = this._getCurrentTrackTitle();
    }
    if(this._isPlayerBuffering() ){
      trackLabelPlaceholder = `${isBufferingLabel} ${trackLabelPlaceholder}`;
    }
    trackLabelPlaceholder = `T-IDX:${trackIndex}` + trackLabelPlaceholder;
    return (
      <View style={styles.mainContainer}>
        <TouchableOpacity style={styles.container} onPress={this._onPickerToggle}>
          <Text style={styles.trackname}>
            { trackLabelPlaceholder }
          </Text>
        </TouchableOpacity>
        <View style={styles.horizontalContainer} >
          <Text style={styles.playbackTime}>{this._formatAsMinutes(this.state.elapsed)}</Text>
          <MultiSlider
            values={this.state.sliderOneValue}
            min={0}
            max={100}
            onValuesChange={this._onMultiSliderValuesChange}
            onValuesChangeFinish={this._onSeekToTime}
            sliderLength={progressTrackLength}
            trackStyle={{ borderRadius: 7, height: 2 }}
            selectedStyle={{backgroundColor: 'rgba(255,255,255,0.5)'}}
            unselectedStyle={{backgroundColor: 'rgba(255,255,255,0.5)'}}
            markerStyle={
              { height:15,
                width: 15,
                borderRadius: 7.5,
                backgroundColor:'#ffffff',
                borderWidth: 0
                }
              } />
            <Text style={styles.playbackTime}>{this._formatAsMinutes(this.state.duration)}</Text>
        </View>
        <View style={styles.horizontalContainer}>
          <TouchableOpacity style={styles.container} onPress={this._goToPrevTrack}>
            <Text style={styles.welcome}>
              Prev
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.container} onPress={this._onPlayToggleOnePress}>
            <Text style={styles.welcome}>
              {playbackStateLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.container} onPress={this._onStopToggleOnePress}>
            <Text style={styles.welcome}>
              Stop
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.container} onPress={this._goToNextTrack}>
            <Text style={styles.welcome}>
              Next
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.volumeSlider}>
          <Slider step={0.05}
            minimumTrackTintColor={sliderTrackStyles.min}
            maximumTrackTintColor={sliderTrackStyles.max}
            onValueChange={this._onVolumeValueChange}
            value={this.state.initialSliderValue} />
        </View>

      </View>
    );
  }
}
const volumeMarginSide = 80;
const volumeMarginVertical = 20;
const playbackHorizontalMargin = 10;
const mainFgColor = '#FFFFFF';

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
  progressSlider : {
    flex:1,
  },
  playbackTime : {
    textAlign: 'center',
    color: mainFgColor,
    margin: playbackHorizontalMargin,
    marginTop: 6
  },
  volumeSlider:{
    marginLeft:volumeMarginSide,
    marginRight:volumeMarginSide,
    marginBottom:volumeMarginVertical,
    alignItems: 'stretch',
    justifyContent: 'center'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    color: mainFgColor,
    margin: 10,
  },
  trackname : {
    fontSize: 16,
    textAlign: 'center',
    color: mainFgColor,
    margin: 10,
  }
});
const sliderTrackStyles = {
  max : 'rgba(255,255,255,0.3)',
  min : mainFgColor
};
AudioPlayerContainer.propTypes = {

};
AppRegistry.registerComponent('AudioPlayerContainer', () => AudioPlayerContainer);

export default AudioPlayerContainer;
