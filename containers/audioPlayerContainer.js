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
import {
  setPlaybackStatus,
} from '../redux/actions/playbackStatusActions';
import {
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
import SoundCloudApi from '../modules/SoundcloudApi';
import StreamTokenManager from  '../modules/StreamTokenManager';

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
    this.onPlayTogglePress = this.onPlayTogglePress.bind(this);
    this.onPickerToggle = this.onPickerToggle.bind(this);
    this.onTrackLabelPressed = this.onTrackLabelPressed.bind(this);
    this.onVolumeValueChange = this.onVolumeValueChange.bind(this);
    this.onSeekToTime = this.onSeekToTime.bind(this);
    this.onSeekToTimeStart = this.onSeekToTimeStart.bind(this);
    this.onProgressTick = this.onProgressTick.bind(this);
    this.goToNextTrack = this.goToNextTrack.bind(this);
    this.goToPrevTrack = this.goToPrevTrack.bind(this);
    this.toggleCurrentPlaylist = this.toggleCurrentPlaylist.bind(this);
    this.toggleFavoritePlaylist = this.toggleFavoritePlaylist.bind(this);
    this.onPlayerStoppedDebounced = throttle(this.onPlayerStoppedDebounced.bind(this),500,{trailing:false});
    this.onAudioRouteInterruption = this.onAudioRouteInterruption.bind(this);
    this.onAudioSessionInterruption = this.onAudioSessionInterruption.bind(this);
    this.onRemoteControlEvent = this.onRemoteControlEvent.bind(this);
    this.openScUploaderLink = this.openScUploaderLink.bind(this);
    this.onUploaderProfileOpen = this.onUploaderProfileOpen.bind(this);
    this.onShuffle = this.onShuffle.bind(this);
    this.onRepeatToggle = this.onRepeatToggle.bind(this);
    this.playCurrentTrack = this.playCurrentTrack.bind(this);
    this.pauseCurrentTrack = this.pauseCurrentTrack.bind(this);
    
    this.scApi = new SoundCloudApi({
      clientId: Config.SC_CLIENT_ID,
      clientSecret: Config.SC_CLIENT_SECRET,
    });
    this.musicPlayer = new HybridPlayer();
    this.previewPlayer = new HybridPlayer();
    this.fileManager = new FileDownloadManager({extension:'mp3'});
    this.state = {
      volume:1,
      userVolume:1,
      volumeSliderValue:1,
      pan : this.props.pan,
      muted : this.props.muted,
      prevRemoteStatus : false,
      playbackIndex : 0
    };
    this.volumeSliderScale = LogSlider({maxpos: 100, minval: 0, maxval: 100});
    const logVolumeLevel = this.linearToLogVolume(this.state.volume);

    this.musicPlayer.setPan(this.state.pan);
    this.previewPlayer.setPan(this.state.pan);
   
    this.musicPlayer.setVolume(logVolumeLevel);
    this.previewPlayer.setVolume(logVolumeLevel);
    
    this.onProgressTick();
    this.setupAudioPlayerListeners();
  }
  setupAudioPlayerListeners(){
    this.musicPlayer.on('stateChange',(evt) => {
      const actionName = evt.status.toLowerCase(),
        hookName = 'onPlayer'+capitalize(actionName);
      if(typeof this[hookName] === 'function' ){
        this[hookName](...[evt]);
      }
    });
    this.musicPlayer.on('AudioRouteInterruptionEvent',this.onAudioRouteInterruption);
    this.musicPlayer.on('AudioSessionInterruptionEvent',this.onAudioSessionInterruption);
    this.musicPlayer.on('RemoteControlEvents',this.onRemoteControlEvent);
  }
  updateComponentPlayerState(){ 
    this.musicPlayer.getStatus((err,data) => {
      let currPlaybackProgress = parseInt( (data.progress * 100) / data.duration ) || 0;
      const statusObj = {
        duration : data.duration,
        elapsed: data.progress,
        playbackProgressValue:[currPlaybackProgress],
        status : data.status,
      };
      this.props.setPlaybackStatus(statusObj);
    });
  }
  onProgressTick(){
    this.updateComponentPlayerState();
    this.playbackProgressRef = setTimeout(
      this.onProgressTick,PROGRESS_TICK_INTERVAL
    );
  }
  clearProgressTick(){
    if(this.playbackProgressRef){
      clearTimeout(this.playbackProgressRef);
    }
  }
  onPlayerStopped(evt){
    this.onPlayerStoppedDebounced(evt);
  }
  onPlayerStoppedDebounced(evt){
    console.log('onPlayerStopped Debounced',evt);
    if(evt.progress == 0 && evt.duration == 0 && evt.prevStatus in PLAYBACK_ENABLED_STATES){
      console.log('track end detected. go to next track');
      if (this.props.repeat) {
        this.musicPlayer.seekToTime(0);
        this.musicPlayer.play();
      } else {
        this.goToNextTrack();
      }
    }
  }
  onAudioRouteInterruption(evt){
    console.log('onAudioRouteChange',evt);
    if(evt.reason === 'AVAudioSessionRouteChangeReasonOldDeviceUnavailable'){
      this.musicPlayer.isPlaying((err,isPlaying) => {
        if(isPlaying) this.musicPlayer.pause();
      });
    }
  }
  onAudioSessionInterruption(evt){
    console.log('AudioSessionInterruption',evt);
    if(evt.reason == 'AVAudioSessionInterruptionTypeBegan'){
      this.playbackInterrupted = this.props.playbackStatus.status in PLAYBACK_ENABLED_STATES;
      if(this.playbackInterrupted){
        this.onPlayTogglePress(); //update ui state to show the playback state change
      }
    }
    if(evt.reason == 'AVAudioSessionInterruptionTypeEnded' && this.playbackInterrupted ){
      this.onPlayTogglePress();
      this.playbackInterrupted = false;
    }
  }
  onRemoteControlEvent(evt){
    console.log('onRemoteControlEvent',evt);
    let exclusiveCommandMap = {
      'nextTrackCommand' : this.goToNextTrack,
      'prevTrackCommand' : this.goToPrevTrack,
      'togglePlayPauseCommand' : this.onPlayTogglePress
    };
    if(this.isCurrentExclusiveSide()){
      (evt.type in exclusiveCommandMap) ? exclusiveCommandMap[evt.type]() : null;
    }
    if(this.isSplitMode() && evt.type === 'togglePlayPauseCommand'){
     
      if(this.props.bothPlayerMuted){
        this.onPlayTogglePress();
      } else {
        this.musicPlayer.getStatus((err,data) => {
          if(!(data.status in PLAYBACK_ENABLED_STATES)) return false;
          console.log('split mode - should pause player');
          this.musicPlayer.pause();
          this.setState({prevRemoteStatus : data.status});
        });
      }
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
  goToNextTrack(){
    const {goToNextTrack,playlist,currentPlaylistId} = this.props;
    goToNextTrack(currentPlaylistId,playlist.shuffle);
  }
  goToPrevTrack(){
    const {goToPrevTrack,playlist,currentPlaylistId} = this.props;
    goToPrevTrack(currentPlaylistId,playlist.shuffle);
  }
  prepareCurrentTrack(shouldAutoPlay){
    this.getCurrentTrackStream().then((streamUrl) => {
      console.log('prepareCurrentTrack url is :',streamUrl,' and play');
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
  startPreviewForTrack(track){
    console.log('AudioPlayerContainer start preview for',track);
    const { playbackStatus } = this.props;
    this.resumePlaybackAfterPreview = 
      playbackStatus.status in PLAYBACK_ENABLED_STATES;
    if( this.resumePlaybackAfterPreview ){
      console.log('pause current song playback');
      this.pauseCurrentTrack();
    }
    this.getTrackStream(track).then(streamUrl => {
      this.previewPlayer.setSoundUrl(streamUrl);
      this.previewPlayer.play();
    });
  }
  stopPreview(){
    console.log('AudioPlayerContainer stop preview ');
    this.previewPlayer.stop();
    if( this.resumePlaybackAfterPreview ){
      console.log('resume current song playback');
      this.playCurrentTrack();
    }
  }
  onPlayTogglePress(){
    this.musicPlayer.getStatus((err,playbackStatus) => {
      playbackStatus.status in PLAYBACK_ENABLED_STATES ?
        this.pauseCurrentTrack() : this.playCurrentTrack();
    });
  }
  playCurrentTrack(){
    if(this.isCurrentMutedSide() || !this.getCurrentTrackUrl()){
      console.log('playCurrentTrack attempted on muted or empty player');
      return false;
    }
    this.musicPlayer.getStatus((err,playbackStatus) => {
      if(playbackStatus.status === audioPlayerStates.PAUSED ){
        console.log('onPlayToggle status PAUSED call .resume()')
        this.musicPlayer.resume()
      }
      if(playbackStatus.status === audioPlayerStates.STOPPED){
        console.log('onPlayToggle status STOPPED call .play()')
        this.musicPlayer.play();
      }
      this.updateComponentPlayerState();
    });
  }
  pauseCurrentTrack(){
    if(this.isCurrentMutedSide() || !this.getCurrentTrackUrl()){
      console.log('pauseCurrentTrack attempted on muted or empty player');
      return false;
    }
    this.musicPlayer.getStatus((err,playbackStatus) => {
      if(playbackStatus.status in PLAYBACK_ENABLED_STATES ){
        console.log('onPlayToggle status PLAYBACK_ENABLED call .pause()')
        this.musicPlayer.pause();
      }
      this.updateComponentPlayerState();
    });
  }
  onUploaderProfileOpen(){
    const currentArtistName = this.getCurrentTrackObj().username;
    if( isLocalTrack(this.getCurrentTrackObj()) ){
      return this.props.navigator.push({
        title : `MediaLibraryPlaylist - ${currentArtistName} - ${this.props.side}`,
        name : `MediaLibraryPlaylist. ${this.props.side}`,
        component: MediaLibraryPlaylist,
        passProps : {
          side : this.props.side,
          browseCategory: 'artist',
          playlist: {
            label : currentArtistName
          },
          onClose: () => this.props.navigator.pop()
        }
      });
    }
    if(!this.props.isOnline) return false;
    this.props.onOpenUploaderProfile(this.getCurrentTrackUploaderLink());
    let prevPickerRoute = this.findRouteByName(
      'UploaderProfileContainer.' + this.props.side
    );
    if(prevPickerRoute){
      return this.props.navigator.jumpTo(prevPickerRoute);
    }
    this.props.navigator.pushToBottom({
      title : `UploaderProfileContainer - ${currentArtistName} - ${this.props.side}`,
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
  onPickerToggle(){
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
  onTrackLabelPressed(){
    if(this.hasCurrentTrackObj()){
      return this.toggleCurrentPlaylist();
    }
    return this.onPickerToggle();
  }
  toggleCurrentPlaylist(){
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
  toggleFavoritePlaylist(){
    let prevRoute =
      this.findRouteByName('CurrentPlaylistContainer.' + this.props.side);
    if(prevRoute){
      return this.props.navigator.jumpTo(prevRoute);
    }
    this.props.navigator.pushToBottom({
      title : `CurrentPlaylistContainer - Favorites - ${this.props.side}`,
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
  onSeekToTime(newPos){
    const { playbackStatus } = this.props;
    let seekedPos = (parseInt(newPos[0]) * playbackStatus.duration) / 100;
    this.musicPlayer.seekToTime(seekedPos);
    this.onProgressTick();
  }
  onSeekToTimeStart(){
    this.clearProgressTick();
  }
  onVolumeValueChange(value) {
    const volume = this.linearToLogVolume(value);
    console.log('increment volume : slider',value,'volume', volume);
    this.setState({
      volume: volume,
      userVolume: volume
    });
  }
  linearToLogVolume(currVolumePosition){
    currVolumePosition = parseInt(currVolumePosition * 100);
    if(currVolumePosition == 0 || currVolumePosition == 100){
      return currVolumePosition / 100;
    }
    return parseFloat((this.volumeSliderScale.value(currVolumePosition)/100).toFixed(2));
  }
  onPlayerMuteChange(muted){
    if(muted){
      this.musicPlayer.setVolume(this.linearToLogVolume(0));
      this.musicPlayer.isPlaying((err,isPlaying) => {
        if(isPlaying) this.musicPlayer.pause();
      });
    } else {
      this.musicPlayer.setVolume(this.linearToLogVolume(this.state.userVolume));
    }
  }
  onShuffle(){
    const { playlist, onSetPlaylistShuffleMode, onMarkShuffleFeatureDiscovery } = this.props;
    onSetPlaylistShuffleMode(!playlist.shuffle);
    onMarkShuffleFeatureDiscovery();
  }
  onRepeatToggle(){
    const { repeat, onSetRepeatMode, onMarkRepeatFeatureDiscovery } = this.props;
    onSetRepeatMode(!repeat);
    onMarkRepeatFeatureDiscovery();
  }
  findRouteByName(name){
    return this.props.navigator.getCurrentRoutes().find((route) => route.name == name);
  }
  componentWillReceiveProps(newProps){
    const newStatus = newProps.playbackStatus;
    const currStatus = this.props.playbackStatus;
    if( newStatus.status != currStatus.status &&
        !newStatus.playerFeedbackState ){
      console.log('app playback state change, trigger player methods');
      if(currStatus.status in PLAYBACK_ENABLED_STATES ){
        this.pauseCurrentTrack();
      } else {
        this.playCurrentTrack();
      }
    }
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
    const { preview } = this.props;
    let prevTrackObj = prevProps.queue[prevState.playbackIndex] || {};
    if(preview.track && prevProps.preview.track !== preview.track){
      this.startPreviewForTrack(preview.track);
    }
    if(!preview.track && prevProps.preview.track){
      this.stopPreview();
    }
    if(prevState.volume !== this.state.volume && !this.state.muted){
      this.musicPlayer.setVolume(this.state.volume);
      this.previewPlayer.setVolume(this.state.volume);
    }
    if(prevState.pan !== this.state.pan){
      this.musicPlayer.setPan(this.state.pan);
      this.previewPlayer.setPan(this.state.pan);
    }
    if(prevState.muted !== this.state.muted){
      this.onPlayerMuteChange(this.state.muted);
    }
    if(this.hasCurrentTrackObj()){
      if(this.getCurrentTrackObj().id != prevTrackObj.id){
        console.log(
           '(state Update) current playing track changed: prepare to play. idx:',
           this.state.playbackIndex,
           'from',
           prevState.playbackIndex
        );
        let shouldAutoPlay = this.props.playlistStore.autoplay;
        this.prepareCurrentTrack(shouldAutoPlay);
      }
    }
    if(this.isCurrentExclusiveSide() && this.getCurrentTrackTitle() ){
      this.setNowPlayingDescription();
    }
  }
  componentWillUnmount(){
    console.log('component will unmount! destory player instance')
    if(this.musicPlayer){
      this.musicPlayer.stop();
      this.musicPlayer.destroy();
    }
    if(this.previewPlayer){
      this.previewPlayer.stop()
      this.previewPlayer.destroy();
    }
  }
  setNowPlayingDescription({isSplit} = {isSplit : false}){
    let description =
      `${this.getCurrentTrackTitle()} • ${this.getCurrentTrackDescription()}`;
    if(isSplit){
      description = messages.SPLIT_MODE_CONTROLS_DISABLED;
    }
    this.musicPlayer.setNowPlayingInfo(
      description,
      NOW_PLAYING_ASSET_NAME,
      this.props.playbackStatus.status in PLAYBACK_ENABLED_STATES,
      this.props.playbackStatus.elapsed,
      this.props.playbackStatus.duration);
  }
  hasCurrentTrackObj(){
    return this.props.queue[this.state.playbackIndex];
  }
  getCurrentTrackObj(){
    return this.props.queue[this.state.playbackIndex] || {};
  }
  getTrackStream(trackObj){
    return this.fileManager.hasLocalAsset(trackObj.id)
    .then(hasLocal => {
      //handle SC cached streams
      if(hasLocal){
        console.log('resolved from local cache');
        let cachedPath = 'file://' + this.fileManager.getLocalAssetPath(trackObj.id);
        return cachedPath;
      }
      //handle local library url
      if (isLocalTrack(trackObj)) {
        console.log('resolved from itunes library');
        return trackObj.streamUrl;
      }
      //handle non cached SC url and inject current client streaming id.
      //every time we use a stream api request 
      //let's check for updating the current streamClient token.
      StreamTokenManager.checkActiveToken();
      const streamUrl = this.scApi.resolvePlayableStreamForTrackId(
        trackObj.id
      );
      console.log('resolved from sc url with active client id',streamUrl);
      return streamUrl;
    })
  }
  getCurrentTrackStream(){
    return this.getTrackStream(this.getCurrentTrackObj());
  }
  getCurrentTrackId(){
    return this.getCurrentTrackObj().id;
  }
  getCurrentTrackUrl(){
    if (isLocalTrack(this.getCurrentTrackObj())) {
      return this.getCurrentTrackObj().streamUrl;
    }
    //every time we use a stream api request 
    //let's check for updating the current streamClient token.
    StreamTokenManager.checkActiveToken();
    const streamUrl = this.scApi.resolvePlayableStreamForTrackId(
      this.getCurrentTrackObj().id
    );
    console.log('getCurrentTrackUrl',streamUrl);
    return streamUrl;
  }
  getCurrentTrackTitle() {
    return this.getCurrentTrackObj().label;
  }
  getCurrentTrackDescription(){
    return  this.getCurrentTrackObj().username;
  }
  getCurrentTrackUploaderLink(){
    return  this.getCurrentTrackObj().scUploaderLink;
  }
  openScUploaderLink(){
    Linking.openURL(
      this.getCurrentTrackUploaderLink() || soundcloudEndpoint.profileUrl
    );
  }
  isCurrentExclusiveSide(){
    return this.state.pan === 0 && this.state.muted === 0;
  }
  isCurrentMutedSide(){
    return this.state.muted === 1;
  }
  isSplitMode(){
    return this.state.pan != 0;
  }
  render() {
    const {playbackStatus} = this.props;
    return <AudioPlayer {...this.props}
        playbackIndex={this.state.playbackIndex}
        status={playbackStatus.status}
        duration={playbackStatus.duration}
        elapsed={playbackStatus.elapsed}
        volumeSliderValue={this.state.volumeSliderValue}
        playbackProgressValue={playbackStatus.playbackProgressValue}
        onPickerToggle={this.onPickerToggle}
        onShuffleModeToggle={this.onShuffle}
        onTrackLabelPress={this.onTrackLabelPressed}
        onUploaderProfileOpen={this.onUploaderProfileOpen}
        openScUploaderLink={this.openScUploaderLink}
        onSeekToTimeStart={this.onSeekToTimeStart}
        onSeekToTime={this.onSeekToTime}
        toggleFavoritePlaylist={this.toggleFavoritePlaylist}
        toggleCurrentPlaylist={this.toggleCurrentPlaylist}
        goToPrevTrack={this.goToPrevTrack}
        onPlayTogglePress={this.onPlayTogglePress}
        goToNextTrack={this.goToNextTrack}
        onVolumeValueChange={this.onVolumeValueChange}
        onRepeatToggle={this.onRepeatToggle}
    />
  }
}

AudioPlayerContainer.propTypes = {};
const mapStateToProps = (state, props) => {
  let ownPlaybackStatus = state.playbackStatus.find((player) => player.side === props.side);
  const bothPlayerMuted = state.playbackStatus.filter(
    player => !(player.status in PLAYBACK_ENABLED_STATES)
  ).length == 2;
  let player = state.players.find((player) => player.side === props.side);
  let playlist = state.playlist.find((playlist) => playlist.side === props.side);
  let preview = state.preview.find(preview => preview.side == props.side);
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
    playlistStore,
    playbackStatus:ownPlaybackStatus,
    bothPlayerMuted,
    preview
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
    setPlaybackStatus: (status) => {
      dispatch(setPlaybackStatus(props.side,status));
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
