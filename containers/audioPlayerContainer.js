/**
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Slider,
  Image,
  View,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import THEME from '../styles/variables';
import { ReactNativeAudioStreaming, Player, ReactNativeStreamingPlayer} from 'react-native-audio-streaming';
import SongPickerContainer from './songPickerContainer';
import MultiSlider from 'react-native-multi-slider';
import throttle from 'lodash.throttle';
import LogSlider from '../helpers/LogSlider';

const PROGRESS_TICK_INTERVAL = 1000;
const capitalize = (str) => str[0].toUpperCase() + str.substring(1).toLowerCase();
const PLAYBACK_ENABLED_STATES = {PLAYING:1,BUFFERING:1};
const PLAYBACK_DISABLED_STATES = {STOPPED:1,PAUSED:1};
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
    this._onSeekToTimeStart = this._onSeekToTimeStart.bind(this);
    this._onProgressTick = this._onProgressTick.bind(this);
    this._goToNextTrack = this._goToNextTrack.bind(this);
    this._goToPrevTrack = this._goToPrevTrack.bind(this);
    this._onPlayerStoppedDebounced = throttle(this._onPlayerStoppedDebounced.bind(this),500,{trailing:false});
    this._onAudioRouteInterruption = this._onAudioRouteInterruption.bind(this);
    this._onRemoteControlEvent = this._onRemoteControlEvent.bind(this);
    this.playerAObj = new ReactNativeStreamingPlayer();

    this.state = {
      songPickerRequester:null,
      currTrackIndex:0,
      playlist:[],
      volume:1,
      userVolume:1,
      elapsed:0,
      duration:0,
      status:false,
      initialSliderValue:1,
      sliderOneValue:[1],
      pan : this.props.pan,
      muted : this.props.muted,
      prevRemoteStatus : false
    };
    this.volumeSliderScale = LogSlider({maxpos: 100, minval: 0, maxval: 100})
    this.playerAObj.setPan(this.state.pan);
    this.playerAObj.setVolume(this._linearToLogVolume(this.state.volume));
    this._onProgressTick();
    console.log("platform ", Platform)
    console.log("player instance Id:",this.playerAObj._nativeInstanceId);

    this.playerAObj.on('stateChange',(evt) => {
      const actionName = evt.status.toLowerCase(),
            hookName = '_onPlayer'+capitalize(actionName);
      if(typeof this[hookName] === 'function' ){
        this[hookName](...[evt]);
      }
    });
    this.playerAObj.on('AudioRouteInterruptionEvent',(evt) => {
      this._onAudioRouteInterruption(evt);
    });
    this.playerAObj.on('RemoteControlEvents',this._onRemoteControlEvent);
  }
  _updateComponentPlayerState(){
    this.playerAObj.getStatus((err,data) => {
      let progres = parseFloat(data.progress);
      let duration = parseFloat(data.duration);
      let currPlaybackProgress = parseInt( (data.progress * 100) / data.duration ) || 0;
      this.setState({
          duration : data.duration,
          elapsed: data.progress,
          sliderOneValue:[currPlaybackProgress],
          status : data.status
        });
    });
  }
  _onProgressTick(){
    this._updateComponentPlayerState();

    this.playbackProgressRef = setTimeout(
      this._onProgressTick,PROGRESS_TICK_INTERVAL
    );
  }
  _clearProgressTick(){
    if(this.playbackProgressRef){
      clearTimeout(this.playbackProgressRef);
    }
  }
  _onPlayerStopped(evt){
    this._onPlayerStoppedDebounced(evt);
  }
  _onPlayerStoppedDebounced(evt){
    console.log('_onPlayerStopped Debounced',evt);
    if(evt.progress == 0 && evt.duration == 0 && evt.prevStatus in {'PLAYING':1,'BUFFERING':1}){
         console.log('track end detected. go to next track');
         this._goToNextTrack();
       }
  }
  _onAudioRouteInterruption(evt){
    console.log('onAudioRouteInterruption',evt);
    if(evt.reason === 'AVAudioSessionRouteChangeReasonOldDeviceUnavailable'){
      this.playerAObj.isPlaying((err,isPlaying) => {
        if(isPlaying) this.playerAObj.pause();
      });
    }
  }
  _onRemoteControlEvent(evt){
    console.log('onRemoteControlEvent',evt);
    let exclusiveCommandMap = {
      'nextTrackCommand' : this._goToNextTrack,
      'prevTrackCommand' : this._goToPrevTrack,
      'togglePlayPauseCommand' : this._onPlayToggleOnePress
    };
    if(this._isCurrentExclusiveSide()){
       (evt.type in exclusiveCommandMap) ? exclusiveCommandMap[evt.type]() : null;
    }
    if(evt.type === 'pauseCommand'){
        this.playerAObj.getStatus((err,data) => {
          if(!(data.status in PLAYBACK_ENABLED_STATES)) return false;
          this.playerAObj.pause();
          this.setState({prevRemoteStatus : data.status});
        });
    }
    if(evt.type === 'playCommand'){
      this.playerAObj.getStatus((err,data) => {
        if(!(data.status in PLAYBACK_DISABLED_STATES) ||
           !(this.state.prevRemoteStatus in PLAYBACK_ENABLED_STATES)){
            return false;
          }
          data.status === 'PAUSED' ? this.playerAObj.resume() : this.playerAObj.play();
      });
    }
  }
  _onSongSelected(rowData){
      this.setState({
        playlist:[rowData],
        currTrackIndex:0
      });
  }
  _onSongQueued(nextTrack){
    this.setState((state,props) => ({
      playlist : [...state.playlist,nextTrack]
    }));
  }
  _goToNextTrack(){

    if( this.state.currTrackIndex === (this.state.playlist.length -1) ){
       console.log('reset to trackIndex 0')
       return this.setState({currTrackIndex : 0});
    }

    this.setState((state,props) => ({currTrackIndex: state.currTrackIndex +1}))
  }
  _goToPrevTrack(){
    if(this.state.currTrackIndex === 0){
       return this.setState({currTrackIndex : 0});
    }
    this.setState((state,props) => ({currTrackIndex: state.currTrackIndex - 1}))
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
    this._updateComponentPlayerState();
  }
  _playCurrentTrack(){

  }
  _pauseCurrentTrack(){

  }
  _onPlayToggleOnePress(){
      if(this._isCurrentMutedSide()){
        console.log('toggle playback attempted on muted player');
        return false;
      }
      console.log('_onPlayToggle checks passed')
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
        this._updateComponentPlayerState();
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
  _onMultiSliderValuesChange(values){
    console.log('_onMultiSliderValuesChange')
  }
  _onSeekToTime(newPos){
    let seekedPos = (parseInt(newPos[0]) * this.state.duration) / 100;
    this.playerAObj.seekToTime(seekedPos);
    this._onProgressTick();
  }
  _onSeekToTimeStart(){
    this._clearProgressTick();
  }
  _onVolumeValueChange(value) {
    const volume = this._linearToLogVolume(value);
    console.log('increment volume : slider',value,'volume', volume);
    this.setState({
      volume: volume,
      userVolume: volume
    });
  }
  _linearToLogVolume(currVolumePosition){
    currVolumePosition = parseInt(currVolumePosition * 100);
    if(currVolumePosition == 0 || currVolumePosition == 100){
       return currVolumePosition / 100;
    }
    return parseFloat((this.volumeSliderScale.value(currVolumePosition)/100).toFixed(2));
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
      console.log('current playing track changed: prepare to play. idx:',this.state.currTrackIndex);
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
  _getCurrentTrackArtwork(){
    const scArtwork = this._getCurrentTrackObj().artwork ?
      this._getCurrentTrackObj().artwork.replace('-large', '-t500x500') : null;
    return scArtwork || false;
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
  _isCurrentExclusiveSide(){
    return this.state.pan === 0 && this.state.muted === 0;
  }
  _isCurrentMutedSide(){
    return this.state.muted === 1;
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
    let progressTrackLength = width - 130;
    let trackIndex = this._getCurrentTrackIndex();
    let trackLabelPlaceholder = 'Tap to load ' + sideLabel[this.props.side] + ' track...';
    if(this._getCurrentTrackTitle() ){
        trackLabelPlaceholder = this._getCurrentTrackTitle();
    }
    if(this._isPlayerBuffering() ){
      trackLabelPlaceholder = `${isBufferingLabel} ${trackLabelPlaceholder}`;
    }
    return (
      <View style={styles.mainContainer}>
        <View style={styles.artwork}>
          {this._getCurrentTrackArtwork() ?
            <Image
              style={[styles.artworkImage,{width:width}]}
              source={{uri:this._getCurrentTrackArtwork()}}
              resizeMode={'cover'}
            /> :
            <Image style={[styles.artworkImage,{width:width}]} />
          }
        </View>
        <View style={styles.tracknameContainer}>
          <TouchableOpacity  onPress={this._onPickerToggle}>
            <Text style={styles.trackname} numberOfLines={1} ellipsizeMode={'tail'}>
              { trackLabelPlaceholder }
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.horizontalContainer} >
          <Text style={styles.playbackTime}>{this._formatAsMinutes(this.state.elapsed)}</Text>
          <View style={styles.playbackTrackContainer}>
            <MultiSlider
              values={this.state.sliderOneValue}
              min={0}
              max={100}
              onValuesChange={this._onMultiSliderValuesChange}
              onValuesChangeFinish={this._onSeekToTime}
              onValuesChangeStart={this._onSeekToTimeStart}
              sliderLength={progressTrackLength}
              trackStyle={{ borderRadius: 7, height: 2 }}
              selectedStyle={{backgroundColor: 'rgba(255,255,255,0.5)'}}
              unselectedStyle={{backgroundColor: 'rgba(255,255,255,0.5)'}}
              markerStyle={markerStyle} />
          </View>
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
        <View style={styles.horizontalContainer}>
          <View style={styles.volumeSlider}>
            <Slider step={0.05}
              minimumTrackTintColor={sliderTrackStyles.min}
              maximumTrackTintColor={sliderTrackStyles.max}
              onValueChange={this._onVolumeValueChange}
              value={this.state.initialSliderValue} />
          </View>
        </View>
      </View>
    );
  }
}
const volumeMarginSide = 80;
const volumeMarginVertical = 10;
const playbackHorizontalMargin = 15;
const mainFgColor = '#FFFFFF';
const overImageShadowColor = 'rgb(0,0,0)';
const overImageShadowOffset = {width:1,height:1};
const overImageShadowRadious = 8;
const artworkPlaceholderColor = '#121314';
const textShadowStyle = {
  textShadowColor: overImageShadowColor,
  textShadowOffset: overImageShadowOffset,
  textShadowRadius : overImageShadowRadious,
}
const styles = StyleSheet.create({
  mainContainer:{
    flex:1
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  horizontalContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor:THEME.textOverlayBgColor
  },
  progressSlider : {
    flex:1,
  },
  playbackTime : Object.assign({
    textAlign: 'center',
    color: mainFgColor,
    textShadowColor: overImageShadowColor,
    height:30,
    lineHeight: 22,
    width:50
  },textShadowStyle),
  playbackTrackContainer:{

    marginHorizontal: playbackHorizontalMargin
  },
  volumeSlider:{
    flex:1,
    justifyContent: 'center',
    marginHorizontal: volumeMarginSide
  },
  welcome: Object.assign({
    fontSize: 20,
    textAlign: 'center',
    color: mainFgColor,
    margin: 10,
    height: 30
  },textShadowStyle),
  tracknameContainer:{
    flex:2,
    flexDirection:'column',
    justifyContent:'center',
    backgroundColor:THEME.textOverlayBgColor
  },
  trackname : Object.assign({
    fontSize: 20,
    textAlign: 'center',
    color: mainFgColor,
    backgroundColor: 'transparent',
    lineHeight: 32,
    height: 40,
    paddingLeft:20,
    paddingRight:20
  },textShadowStyle),
  artwork : {
    justifyContent: 'center',
    flexDirection:'row',
    flex:0,
    height:0
  },
  artworkImage : {
    width: 250,
    height: 250,
    backgroundColor:artworkPlaceholderColor
  }
});
const sliderTrackStyles = {
  max : 'rgba(255,255,255,0.3)',
  min : mainFgColor
};
const markerStyle = {
  height:20,
  width:20,
  borderRadius: 10,
  backgroundColor:THEME.mainHighlightColor,
  borderWidth: 0,
  shadowColor:'black',
  shadowRadius:3,
  shadowOffset: { width:0,height:2},
  shadowOpacity: 0.3
};
AudioPlayerContainer.propTypes = {

};
AppRegistry.registerComponent('AudioPlayerContainer', () => AudioPlayerContainer);

export default AudioPlayerContainer;
