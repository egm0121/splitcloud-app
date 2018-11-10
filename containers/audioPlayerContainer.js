import React, { Component } from 'react';
import {
  AppRegistry,
  Linking
} from 'react-native';
import {
  audioPlayerStates,
  soundcloudEndpoint,
  playbackModeTypes,
  messages,
  playlistType,
  NOW_PLAYING_ASSET_NAME,
  FEATURE_SHUFFLE,
  FEATURE_REPEAT,
  FEATURE_SUGGESTED,
} from '../helpers/constants';
import HybridPlayer from '../modules/HybridPlayer';
import AudioPlayer from '../components/audioPlayer';
import SongPickerContainer from './songPickerContainer';
import UploaderProfileContainer from './uploaderProfileContainer';
import CurrentPlaylistContainer from './currentPlaylistContainer';
import Config from '../helpers/config';
import {
  incrementCurrentPlayIndex,
  decrementCurrentPlayIndex,
  setPlaylistShuffleMode,
} from '../redux/actions/currentPlaylistActions';
import{
  updateLastUploaderProfile
} from '../redux/actions/uploaderProfileActions';
import { 
  markFeatureDiscovery,
} from '../redux/actions/featureDiscoveryActions';
import {
  togglePlayerRepeat
} from '../redux/actions/playbackModeActions';
import { connect } from 'react-redux';
import throttle from 'lodash.throttle';
import LogSlider from '../helpers/LogSlider';
import FileDownloadManager from '../modules/FileDownloadManager';
import { isLocalTrack } from '../helpers/formatters';
import MediaLibraryPlaylist from './mediaLibraryPlaylist';

const PROGRESS_TICK_INTERVAL = 1000;
const capitalize = (str) => str[0].toUpperCase() + str.substring(1).toLowerCase();
const PLAYBACK_ENABLED_STATES = {
  [audioPlayerStates.PLAYING]:1,
  [audioPlayerStates.BUFFERING]:1
};
const PLAYBACK_DISABLED_STATES = {
  [audioPlayerStates.STOPPED]:1,
  [audioPlayerStates.PAUSED]:1
};
class AudioPlayerContainer extends Component {
  constructor(props){
    super(props);
    this._onPlayTogglePress = this._onPlayTogglePress.bind(this);
    this._onPickerToggle = this._onPickerToggle.bind(this);
    this._onTrackLabelPressed = this._onTrackLabelPressed.bind(this);
    this._onVolumeValueChange = this._onVolumeValueChange.bind(this);
    this._onSeekToTime = this._onSeekToTime.bind(this);
    this._onSeekToTimeStart = this._onSeekToTimeStart.bind(this);
    this._onProgressTick = this._onProgressTick.bind(this);
    this._goToNextTrack = this._goToNextTrack.bind(this);
    this._goToPrevTrack = this._goToPrevTrack.bind(this);
    this._toggleCurrentPlaylist = this._toggleCurrentPlaylist.bind(this);
    this._toggleFavoritePlaylist = this._toggleFavoritePlaylist.bind(this);
    this._onPlayerStoppedDebounced = throttle(this._onPlayerStoppedDebounced.bind(this),500,{trailing:false});
    this._onAudioRouteInterruption = this._onAudioRouteInterruption.bind(this);
    this._onAudioSessionInterruption = this._onAudioSessionInterruption.bind(this);
    this._onRemoteControlEvent = this._onRemoteControlEvent.bind(this);
    this._openScUploaderLink = this._openScUploaderLink.bind(this);
    this._onUploaderProfileOpen = this._onUploaderProfileOpen.bind(this);
    this._onShuffle = this._onShuffle.bind(this);
    this._onRepeatToggle = this._onRepeatToggle.bind(this);
    this.scClientId = Config.SC_CLIENT_ID;
    this.musicPlayer = new HybridPlayer();
    this.fileManager = new FileDownloadManager({extension:'mp3'});
    this.state = {
      volume:1,
      userVolume:1,
      elapsed:0,
      duration:0,
      status:'',
      volumeSliderValue:1,
      playbackProgressValue:[1],
      pan : this.props.pan,
      muted : this.props.muted,
      prevRemoteStatus : false,
      playbackIndex : 0
    };
    this.volumeSliderScale = LogSlider({maxpos: 100, minval: 0, maxval: 100});
    this.musicPlayer.setPan(this.state.pan);
    this.musicPlayer.setVolume(this._linearToLogVolume(this.state.volume));
    this._onProgressTick();
    this.setupAudioPlayerListeners();
  }
  setupAudioPlayerListeners(){
    this.musicPlayer.on('stateChange',(evt) => {
      const actionName = evt.status.toLowerCase(),
        hookName = '_onPlayer'+capitalize(actionName);
      if(typeof this[hookName] === 'function' ){
        this[hookName](...[evt]);
      }
    });
    this.musicPlayer.on('AudioRouteInterruptionEvent',this._onAudioRouteInterruption);
    this.musicPlayer.on('AudioSessionInterruptionEvent',this._onAudioSessionInterruption);
    this.musicPlayer.on('RemoteControlEvents',this._onRemoteControlEvent);
  }
  _updateComponentPlayerState(){
    this.musicPlayer.getStatus((err,data) => {
      let currPlaybackProgress = parseInt( (data.progress * 100) / data.duration ) || 0;
      this.setState({
        duration : data.duration,
        elapsed: data.progress,
        playbackProgressValue:[currPlaybackProgress],
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
    if(evt.progress == 0 && evt.duration == 0 && evt.prevStatus in PLAYBACK_ENABLED_STATES){
      console.log('track end detected. go to next track');
      if (this.props.repeat) {
        this.musicPlayer.seekToTime(0);
        this.musicPlayer.play();
      } else {
        this._goToNextTrack();
      }
    }
  }
  _onAudioRouteInterruption(evt){
    console.log('onAudioRouteChange',evt);
    if(evt.reason === 'AVAudioSessionRouteChangeReasonOldDeviceUnavailable'){
      this.musicPlayer.isPlaying((err,isPlaying) => {
        if(isPlaying) this.musicPlayer.pause();
      });
    }
  }
  _onAudioSessionInterruption(evt){
    console.log('AudioSessionInterruption',evt);
    if(evt.reason == 'AVAudioSessionInterruptionTypeBegan'){
      this.playbackInterrupted = this.state.status in PLAYBACK_ENABLED_STATES;
      if(this.playbackInterrupted){
        this._onPlayTogglePress(); //update ui state to show the playback state change
      }
    }
    if(evt.reason == 'AVAudioSessionInterruptionTypeEnded' && this.playbackInterrupted ){
      this._onPlayTogglePress();
      this.playbackInterrupted = false;
    }
  }
  _onRemoteControlEvent(evt){
    console.log('onRemoteControlEvent',evt);
    let exclusiveCommandMap = {
      'nextTrackCommand' : this._goToNextTrack,
      'prevTrackCommand' : this._goToPrevTrack,
      'togglePlayPauseCommand' : this._onPlayTogglePress
    };
    if(this._isCurrentExclusiveSide()){
      (evt.type in exclusiveCommandMap) ? exclusiveCommandMap[evt.type]() : null;
    }
    if(evt.type === 'pauseCommand'){
      this.musicPlayer.getStatus((err,data) => {
        console.log('remote pauseCommand should pause',data.status);
        if(!(data.status in PLAYBACK_ENABLED_STATES)) return false;
        console.log('remote pauseCommand did pause')
        this.musicPlayer.pause();
        this.setState({prevRemoteStatus : data.status});
      });
    }
    if(evt.type === 'playCommand'){
      this.musicPlayer.getStatus((err,data) => {
        console.log('remote playCommand should play',data.status,this.state.prevRemoteStatus);
        if( data.status in PLAYBACK_ENABLED_STATES ||
            this.state.prevRemoteStatus in PLAYBACK_DISABLED_STATES
          ){
          return false;
        }
        if( data.status === 'PAUSED' ){
          console.log('remote playCommand did resume');
          this.musicPlayer.resume()
        } else {
          console.log('remote playCommand did play');
          this.musicPlayer.play();
        }
      });
    }
  }
  _goToNextTrack(){
    const {goToNextTrack,playlist,currentPlaylistId} = this.props;
    goToNextTrack(currentPlaylistId,playlist.shuffle);
  }
  _goToPrevTrack(){
    const {goToPrevTrack,playlist,currentPlaylistId} = this.props;
    goToPrevTrack(currentPlaylistId,playlist.shuffle);
  }
  _prepareCurrentTrack(shouldAutoPlay){
    this._getCurrentTrackStream().then((streamUrl) => {
      console.log('_prepareCurrentTrack url is :',streamUrl,' and play');
      this.musicPlayer.isPlaying((err,isPlaying) => {
        if(isPlaying) {
          console.log('pause and set url to next')
          this.musicPlayer.pause();
        }
        if(streamUrl){
          this.musicPlayer.setSoundUrl(streamUrl);
          this.musicPlayer.play();
          if( !shouldAutoPlay ){
            console.log('pause playback no autoplay');
            setTimeout(() => this.musicPlayer.pause(),50);
            setTimeout(() => this.musicPlayer.pause(),100);
          }
        } else {
          this.musicPlayer.stop();
        }
      });
    }).catch(err => console.log('err hasLocalAsset',err));
  }
  _onPlayTogglePress(){
    if(this._isCurrentMutedSide() || !this._getCurrentTrackUrl()){
      console.log('toggle playback attempted on muted or empty player');
      return false;
    }
    console.log('_onPlayToggle checks passed');
    this.musicPlayer.getStatus((err,playbackStatus) => {
      if(playbackStatus.status in PLAYBACK_ENABLED_STATES ){
        console.log('_onPlayToggle status PLAYBACK_ENABLED call .pause()')
        this.musicPlayer.pause();
      }
      if(playbackStatus.status === audioPlayerStates.PAUSED ){
        console.log('_onPlayToggle status PAUSED call .resume()')
        this.musicPlayer.resume()
      }
      if(playbackStatus.status === audioPlayerStates.STOPPED){
        console.log('_onPlayToggle status STOPPED call .play()')
        this.musicPlayer.play();
      }
      this._updateComponentPlayerState();
    });
  }
  _onUploaderProfileOpen(){
    if( isLocalTrack(this._getCurrentTrackObj()) ){
      return this.props.navigator.push({
        title : 'MediaLibraryPlaylist - ' + this.props.side,
        name : 'MediaLibraryPlaylist.' + this.props.side,
        component: MediaLibraryPlaylist,
        passProps : {
          side : this.props.side,
          browseCategory: 'artist',
          playlist: {
            label : this._getCurrentTrackObj().username
          },
          onClose: () => this.props.navigator.pop()
        }
      });
    }
    if(!this.props.isOnline) return false;
    this.props.onOpenUploaderProfile(this._getCurrentTrackUploaderLink());
    let prevPickerRoute = this.findRouteByName(
      'UploaderProfileContainer.' + this.props.side
    );
    if(prevPickerRoute){
      return this.props.navigator.jumpTo(prevPickerRoute);
    }
    this.props.navigator.pushToBottom({
      title : 'UploaderProfileContainer - ' + this.props.side,
      name : 'UploaderProfileContainer.' + this.props.side,
      component: UploaderProfileContainer,
      passProps : {
        side : this.props.side,
        onClose: () => this.props.navigator.jumpTo(
            this.findRouteByName(this.props.routeName)
        )
      }
    });
  }
  _onPickerToggle(){
    let prevPickerRoute =
      this.findRouteByName('SongPickerContainer.' + this.props.side);
    if(prevPickerRoute){
      return this.props.navigator.jumpTo(prevPickerRoute);
    }
    this.props.navigator.pushToBottom({
      title : 'SongPickerContainer - ' + this.props.side,
      name : 'SongPickerContainer.' + this.props.side,
      component: SongPickerContainer,
      passProps : {
        side : this.props.side,
        onClose: () => {
          this.props.navigator.jumpTo(
            this.findRouteByName(this.props.routeName)
          );
        }
      }
    });
  }
  _onTrackLabelPressed(){
    if(this._hasCurrentTrackObj()){
      return this._toggleCurrentPlaylist();
    }
    return this._onPickerToggle();
  }
  _toggleCurrentPlaylist(){
    this.props.onMarkSuggestedFeatureDiscovery();
    this.props.navigator.push({
      title : 'CurrentPlaylistContainer -' + this.props.currentPlaylistId,
      name : 'CurrentPlaylistContainer' + this.props.currentPlaylistId,
      component: CurrentPlaylistContainer,
      passProps : {
        playlistId: this.props.currentPlaylistId,
        playlistTitle : `Up Next - ${this.props.side == 'L' ? 'Left' : 'Right'} Side`,
        side : this.props.side,
        showMenu : false,
        playlistType : playlistType.UP_NEXT,
        onClose: () => this.props.navigator.pop()
      }
    });
  }
  _toggleFavoritePlaylist(){
    let prevRoute =
      this.findRouteByName('CurrentPlaylistContainer.' + this.props.side);
    if(prevRoute){
      return this.props.navigator.jumpTo(prevRoute);
    }
    this.props.navigator.pushToBottom({
      title : 'CurrentPlaylistContainer - ' + this.props.side,
      name : 'CurrentPlaylistContainer.' + this.props.side,
      component: CurrentPlaylistContainer,
      passProps : {
        side : this.props.side,
        playlistId: 'default_'+this.props.side,
        playlistTitle : `Favorites Tracks - ${this.props.side == 'L' ? 'Left' : 'Right'} Side`,
        playlistType : playlistType.FAVORITES,
        onClose: () => {
          this.props.navigator.jumpTo(
            this.findRouteByName(this.props.routeName)
          );
        }
      }
    });
  }
  _onSeekToTime(newPos){
    let seekedPos = (parseInt(newPos[0]) * this.state.duration) / 100;
    this.musicPlayer.seekToTime(seekedPos);
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
      this.musicPlayer.setVolume(this._linearToLogVolume(0));
      this.musicPlayer.isPlaying((err,isPlaying) => {
        if(isPlaying) this.musicPlayer.pause();
      });
    } else {
      this.musicPlayer.setVolume(this._linearToLogVolume(this.state.userVolume));
    }
  }
  _onShuffle(){
    const { playlist, onSetPlaylistShuffleMode, onMarkShuffleFeatureDiscovery } = this.props;
    onSetPlaylistShuffleMode(!playlist.shuffle);
    onMarkShuffleFeatureDiscovery();
  }
  _onRepeatToggle(){
    const { repeat, onSetRepeatMode, onMarkRepeatFeatureDiscovery } = this.props;
    onSetRepeatMode(!repeat);
    onMarkRepeatFeatureDiscovery();
  }
  findRouteByName(name){
    return this.props.navigator.getCurrentRoutes().find((route) => route.name == name);
  }
  componentWillReceiveProps(newProps){
    console.log('new props',newProps.currentPlaylistId,newProps.playlistStore)
    if(newProps.pan != this.props.pan || newProps.muted != this.props.muted){
      this.setState({
        pan:newProps.pan,
        muted:newProps.muted
      });
      if(newProps.mode == playbackModeTypes.SPLIT){
        this.setNowPlayingDescription({isSplit:true});
      }
    }
    if(newProps.currentTrackIndex != this.props.currentTrackIndex){
      this.setState({playbackIndex : newProps.currentTrackIndex})
    }
    if(newProps.queue !== this.props.queue){
      console.log('(props Update) playlist updated:',newProps.queue);
    }
  }
  componentDidUpdate(prevProps, prevState){
    let prevTrackObj = prevProps.queue[prevState.playbackIndex] || {};

    if(prevState.volume !== this.state.volume && !this.state.muted){
      this.musicPlayer.setVolume(this.state.volume);
    }
    if(prevState.pan !== this.state.pan){
      this.musicPlayer.setPan(this.state.pan);
    }
    if(prevState.muted !== this.state.muted){
      this._onPlayerMuteChange(this.state.muted);
    }
    if(this._hasCurrentTrackObj()){
      if(this._getCurrentTrackObj().id != prevTrackObj.id){
        console.log(
           '(state Update) current playing track changed: prepare to play. idx:',
           this.state.playbackIndex,
           'from',
           prevState.playbackIndex
        );
        let shouldAutoPlay = this.props.playlistStore.autoplay;
        this._prepareCurrentTrack(shouldAutoPlay);
      }
    }
    if(this._isCurrentExclusiveSide() && this._getCurrentTrackTitle() ){
      this.setNowPlayingDescription();
    }
  }
  componentWillUnmount(){
    console.log('component will unmount! destory player instance')
    if(this.musicPlayer){
      this.musicPlayer.stop();
      this.musicPlayer.destroy();
    }
  }
  setNowPlayingDescription({isSplit} = {isSplit : false}){
    let description =
      `${this._getCurrentTrackTitle()} • ${this._getCurrentTrackDescription()}`;
    if(isSplit){
      description = messages.SPLIT_MODE_CONTROLS_DISABLED;
    }
    this.musicPlayer.setNowPlayingInfo(
      description,
      NOW_PLAYING_ASSET_NAME,
      this.state.status in PLAYBACK_ENABLED_STATES);
  }
  _hasCurrentTrackObj(){
    return this.props.queue[this.state.playbackIndex];
  }
  _getCurrentTrackObj(){
    return this.props.queue[this.state.playbackIndex] || {};
  }
  _getCurrentTrackStream(){
    return this.fileManager.hasLocalAsset(this._getCurrentTrackId())
    .then(hasLocal => {
      if(hasLocal){
        console.log('playback from local cache');
        let cachedPath = 'file://' + this.fileManager.getLocalAssetPath(this._getCurrentTrackId());
        return cachedPath;
      } else {
        return this._getCurrentTrackUrl();
      }
    })
  }
  _getCurrentTrackId(){
    return this._getCurrentTrackObj().id;
  }
  _getCurrentTrackUrl(){
    return this._getCurrentTrackObj().streamUrl;
  }
  _getCurrentTrackTitle() {
    return this._getCurrentTrackObj().label;
  }
  _getCurrentTrackDescription(){
    return  this._getCurrentTrackObj().username;
  }
  _getCurrentTrackUploaderLink(){
    return  this._getCurrentTrackObj().scUploaderLink;
  }
  _openScUploaderLink(){
    Linking.openURL(
      this._getCurrentTrackUploaderLink() || soundcloudEndpoint.profileUrl
    );
  }
  _isCurrentExclusiveSide(){
    return this.state.pan === 0 && this.state.muted === 0;
  }
  _isCurrentMutedSide(){
    return this.state.muted === 1;
  }
  render() {
    return <AudioPlayer {...this.props}
        playbackIndex={this.state.playbackIndex}
        status={this.state.status}
        duration={this.state.duration}
        elapsed={this.state.elapsed}
        volumeSliderValue={this.state.volumeSliderValue}
        playbackProgressValue={this.state.playbackProgressValue}
        onPickerToggle={this._onPickerToggle}
        onShuffleModeToggle={this._onShuffle}
        onTrackLabelPress={this._onTrackLabelPressed}
        onUploaderProfileOpen={this._onUploaderProfileOpen}
        openScUploaderLink={this._openScUploaderLink}
        onSeekToTimeStart={this._onSeekToTimeStart}
        onSeekToTime={this._onSeekToTime}
        toggleFavoritePlaylist={this._toggleFavoritePlaylist}
        toggleCurrentPlaylist={this._toggleCurrentPlaylist}
        goToPrevTrack={this._goToPrevTrack}
        onPlayTogglePress={this._onPlayTogglePress}
        goToNextTrack={this._goToNextTrack}
        onVolumeValueChange={this._onVolumeValueChange}
        onRepeatToggle={this._onRepeatToggle}
    />
  }
}

AudioPlayerContainer.propTypes = {};
const mapStateToProps = (state, props) => {
  let player = state.players.find((player) => player.side === props.side);
  let playlist = state.playlist.find((playlist) => playlist.side === props.side);
  let playlistStore = state.playlistStore.find(playlistStore => playlistStore.id == playlist.currentPlaylistId);
  let queue = playlistStore.tracks;
  let currentPlaylistId = playlist.currentPlaylistId;
  let isFullscreen = state.mode === props.side;
  let isSplitMode = state.mode === playbackModeTypes.SPLIT;
  return {
    player,
    pan : player.pan,
    muted : player.muted,
    repeat : player.repeat,
    isFullscreen,
    playlist,
    queue,
    currentTrackIndex:playlistStore.currentTrackIndex,
    isSplitMode,
    currentPlaylistId,
    playlistStore
  }
};
const mapDispatchToProps = (dispatch, props) => {
  return {
    goToNextTrack: (playlistId,isShuffle) => {
      dispatch(incrementCurrentPlayIndex(props.side,playlistId,isShuffle))
    },
    goToPrevTrack: (playlistId,isShuffle) => {
      dispatch(decrementCurrentPlayIndex(props.side,playlistId,isShuffle))
    },
    onOpenUploaderProfile : (url) => dispatch(updateLastUploaderProfile(props.side,url)),
    onSetPlaylistShuffleMode : (isActive) => dispatch(setPlaylistShuffleMode(props.side,isActive)),
    onSetRepeatMode : (isActive) => dispatch(togglePlayerRepeat(props.side,isActive)),
    onMarkShuffleFeatureDiscovery: () => dispatch(markFeatureDiscovery(FEATURE_SHUFFLE)),
    onMarkRepeatFeatureDiscovery: () => dispatch(markFeatureDiscovery(FEATURE_REPEAT)),
    onMarkSuggestedFeatureDiscovery: () => dispatch(markFeatureDiscovery(FEATURE_SUGGESTED))
  };
};
let ConnectedAudioPlayerContainer = connect(mapStateToProps,mapDispatchToProps)(AudioPlayerContainer);

AppRegistry.registerComponent('AudioPlayerContainer', () => ConnectedAudioPlayerContainer);

export default ConnectedAudioPlayerContainer;
