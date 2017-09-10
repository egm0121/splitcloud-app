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
  Platform,
  Linking
} from 'react-native';
import THEME from '../styles/variables';
import {
  audioPlayerStates,
  soundcloudEndpoint,
  playbackModeTypes,
  messages,
  NOW_PLAYING_ASSET_NAME
} from '../helpers/constants';
import { ReactNativeStreamingPlayer } from 'react-native-audio-streaming';
import SongPickerContainer from './songPickerContainer';
import CurrentPlaylistContainer from './currentPlaylistContainer';
import SearchIcon from '../components/searchIcon';
import Button from '../components/button';
import Config from '../helpers/config';
import {
  addPlaylistItem,
  incrementCurrentPlayIndex,
  decrementCurrentPlayIndex,
  changeCurrentPlayIndex
} from '../redux/actions/currentPlaylistActions';
import {
  pushNotification
} from '../redux/actions/notificationActions';
import { connect } from 'react-redux';
import MultiSlider from 'react-native-multi-slider';
import throttle from 'lodash.throttle';
import LogSlider from '../helpers/LogSlider';
import {formatDuration} from '../helpers/formatters';
import FileDownloadManager from '../modules/FileDownloadManager';
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
    this._onSongSelected = this._onSongSelected.bind(this);
    this._onVolumeValueChange = this._onVolumeValueChange.bind(this);
    this._onSeekToTime = this._onSeekToTime.bind(this);
    this._onSeekToTimeStart = this._onSeekToTimeStart.bind(this);
    this._onProgressTick = this._onProgressTick.bind(this);
    this._goToNextTrack = this._goToNextTrack.bind(this);
    this._goToPrevTrack = this._goToPrevTrack.bind(this);
    this._toggleCurrentPlaylist = this._toggleCurrentPlaylist.bind(this);
    this._onPlayerStoppedDebounced = throttle(this._onPlayerStoppedDebounced.bind(this),500,{trailing:false});
    this._onAudioRouteInterruption = this._onAudioRouteInterruption.bind(this);
    this._onRemoteControlEvent = this._onRemoteControlEvent.bind(this);
    this.renderInFullscreen = this.renderInFullscreen.bind(this);
    this._openScUploaderLink = this._openScUploaderLink.bind(this);
    this.scClientId = Config.SC_CLIENT_ID;
    this.playerAObj = new ReactNativeStreamingPlayer();
    this.fileManager = new FileDownloadManager({extension:'mp3'});
    this.state = {
      volume:1,
      userVolume:1,
      elapsed:0,
      duration:0,
      status:false,
      initialSliderValue:1,
      sliderOneValue:[1],
      pan : this.props.pan,
      muted : this.props.muted,
      prevRemoteStatus : false,
      playbackIndex : 0
    };
    this.volumeSliderScale = LogSlider({maxpos: 100, minval: 0, maxval: 100});
    this.playerAObj.setPan(this.state.pan);
    this.playerAObj.setVolume(this._linearToLogVolume(this.state.volume));
    this._onProgressTick();
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
    if(evt.progress == 0 && evt.duration == 0 && evt.prevStatus in PLAYBACK_ENABLED_STATES){
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
      'togglePlayPauseCommand' : this._onPlayTogglePress
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
  _onSongSelected(nextTrackResult){
    this.props.onSongQueued(nextTrackResult);
    this._goToTrack(nextTrackResult);
  }
  _onSongQueued(nextTrackResult){
    this.props.pushNotification({
      type : 'success',
      message : 'Added Track!'
    });
    this.props.onSongQueued(nextTrackResult);
  }
  _goToNextTrack(){
    this.props.goToNextTrack();
  }
  _goToPrevTrack(){
    this.props.goToPrevTrack();
  }
  _goToTrack(track){
    console.log('goToTrack', this.props.playlist.tracks)
    this.props.goToTrack(track);
  }
  _prepareCurrentTrack(shouldAutoPlay){

    this._getCurrentTrackStream().then((streamUrl) => {
      console.log('_prepareCurrentTrack url is :',streamUrl,' and play');
      this.playerAObj.isPlaying((err,isPlaying) => {
        if(isPlaying) {
          console.log('pause and set url to next')
          this.playerAObj.pause();
        }
        if(streamUrl){
          this.playerAObj.setSoundUrl(streamUrl);
          if( shouldAutoPlay ){
            console.log('start playback');
            this.playerAObj.play();
          }
        } else {
          this.playerAObj.stop();
        }
      });
    }).catch(err => console.log('err hasLocalAsset',err));
  }

  _onPlayTogglePress(){
    if(this._isCurrentMutedSide() || !this._getCurrentTrackUrl()){
      console.log('toggle playback attempted on muted player');
      return false;
    }
    console.log('_onPlayToggle checks passed');
    this.playerAObj.getStatus((err,playbackStatus) => {
      if(playbackStatus.status in PLAYBACK_ENABLED_STATES ){
        this.playerAObj.pause();
      }
      if(playbackStatus.status === audioPlayerStates.PAUSED ){
        this.playerAObj.resume()
      }
      if(playbackStatus.status === audioPlayerStates.STOPPED){
        this.playerAObj.play();
      }
      this._updateComponentPlayerState();
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
        },
        onSongSelected : (nextTrack) => {
          this._onSongSelected(nextTrack);
        },
        onSongQueued : (nextTrack) => {
          this._onSongQueued(nextTrack);
        }
      }
    });
  }
  _toggleCurrentPlaylist(){
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
        playlistTitle : `UP NEXT | ${this.props.side == 'L' ? 'LEFT' : 'RIGHT'} PLAYER`,
        onClose: () => {
          this.props.navigator.jumpTo(
            this.findRouteByName(this.props.routeName)
          );
        },
        onTrackSelected : (nextTrack) => {
          this._goToTrack(nextTrack);
        }
      }
    });
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
      this.playerAObj.isPlaying((err,isPlaying) => {
        if(isPlaying) this.playerAObj.pause();
      });
    } else {
      this.playerAObj.setVolume(this._linearToLogVolume(this.state.userVolume));
    }
  }
  findRouteByName(name){
    return this.props.navigator.getCurrentRoutes().find((route) => route.name == name);
  }
  componentWillReceiveProps(newProps){
    if(newProps.pan != this.props.pan || newProps.muted != this.props.muted){
      this.setState({
        pan:newProps.pan,
        muted:newProps.muted
      });
      if(newProps.mode == playbackModeTypes.SPLIT){
        this.setNowPlayingDescription({isSplit:true});
      }
    }
    if(newProps.playlist.currentTrackIndex != this.props.playlist.currentTrackIndex){
      this.setState({playbackIndex : newProps.playlist.currentTrackIndex})
    }
    if(newProps.playlist.tracks !== this.props.playlist.tracks){
      console.log('(props Update) playlist updated:',newProps.playlist);
    }
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
    if(prevProps.playlist.tracks[prevState.playbackIndex] !==
       this.props.playlist.tracks[this.state.playbackIndex]){
      console.log(
         '(state Update) current playing track changed: prepare to play. idx:',
         this.state.playbackIndex
      );
      let shouldAutoPlay = !this.props.playlist.rehydrate;
      this._prepareCurrentTrack(shouldAutoPlay);
    }
    if(this._isCurrentExclusiveSide() && this._getCurrentTrackTitle() ){
      this.setNowPlayingDescription();
    }
  }
  componentWillUnmount(){
    console.log('component will unmount! destory player instance')
    if(this.playerAObj){
      this.playerAObj.stop();
      this.playerAObj.destroy();
    }
  }
  setNowPlayingDescription({isSplit} = {isSplit : false}){
    let description =
      `${this._getCurrentTrackTitle()} • ${this._getCurrentTrackDescription()}`;
    if(isSplit){
      description = messages.SPLIT_MODE_CONTROLS_DISABLED;
    }
    this.playerAObj.setNowPlayingInfo(description,NOW_PLAYING_ASSET_NAME);
  }
  _getCurrentTrackIndex(){
    return this.state.playbackIndex;
  }
  _getCurrentTrackObj(){
    return this.props.playlist.tracks[this.state.playbackIndex] || {};
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
  _getCurrentTrackArtwork(){
    const scArtwork = this._getCurrentTrackObj().artwork ?
      this._getCurrentTrackObj().artwork.replace('-large', '-t500x500') : null;
    return scArtwork || false;
  }
  _getCurrentTrackUploaderLink(){
    return  this._getCurrentTrackObj().scUploaderLink;
  }
  _openScUploaderLink(){
    Linking.openURL(
      this._getCurrentTrackUploaderLink() || soundcloudEndpoint.profileUrl
    );
  }
  _isPlayerBuffering(){
    return this.state.status === audioPlayerStates.BUFFERING;
  }
  _isPlayerPlaying(){
    return this.state.status === audioPlayerStates.PLAYING;
  }
  _isPlayerPaused(){
    return this.state.status === audioPlayerStates.PAUSED;
  }
  _isPlayerStopped(){
    return this.state.status === audioPlayerStates.STOPPED;
  }
  _isCurrentExclusiveSide(){
    return this.state.pan === 0 && this.state.muted === 0;
  }
  _isCurrentMutedSide(){
    return this.state.muted === 1;
  }
  renderInFullscreen(children){
    return this.props.isFullscreen ? children :null;
  }
  renderInSplitMode(children){
    return this.props.isFullscreen ? null : children;
  }
  render() {
    const sideLabel = {
      'L' : 'left',
      'R' : 'right'
    };
    const isBufferingLabel = 'Buffering - ';
    let isUiPlaybackActive = this._isPlayerPlaying() || this._isPlayerBuffering();
    let playbackSource = isUiPlaybackActive ?
      require('../assets/flat_pause.png') : require('../assets/flat_play.png');
    let playPauseButtonStyle = [styles.container];
    playPauseButtonStyle.push(isUiPlaybackActive ?
      styles.pauseToggleButton : styles.playToggleButton);

    let {width} = Dimensions.get('window');
    let progressTrackLength = width - 140;
    let trackIndex = this._getCurrentTrackIndex();
    let showBgArtCover = this._getCurrentTrackArtwork();
    let tracknameStyles = [styles.tracknameContainer];
    let tracknameTextStyles = [styles.trackname];
    let tracknameTextDescription = [styles.trackDescription];
    let playerBgImage = [styles.artworkImage];
    if(this.props.isFullscreen){
      tracknameStyles.push(styles.tracknameFullscreen)
      tracknameTextStyles.push(styles.tracknameTextFullscreen)
      tracknameTextDescription.push(styles.trackDescriptionTextFullscreen)
    }
    let trackDescription = '';
    let trackLabelPlaceholder = 'Tap to load ' + sideLabel[this.props.side] + ' track...';

    let isPlaylistVisible = this.props.playlist.tracks.length > 1;
    if( this._getCurrentTrackTitle() ){
      trackLabelPlaceholder = this._getCurrentTrackTitle();
      trackDescription = 'by '+this._getCurrentTrackDescription();
    }
    if( this._isPlayerBuffering() ){
      trackLabelPlaceholder = `${isBufferingLabel} ${trackLabelPlaceholder}`;
    }
    return (
      <View style={styles.mainContainer} >
        <View style={styles.artwork}>
            <Image
              style={playerBgImage}
              blurRadius={20}
              source={ showBgArtCover ?
                {uri:this._getCurrentTrackArtwork()} :
                require('../assets/alt_artwork.png')
               }
              resizeMode={showBgArtCover ? 'cover' : 'stretch'}>
              <View style={styles.backgroundOverlay}>
                  {this.renderInSplitMode(
                  <View style={[tracknameStyles]}>
                    <View style={[styles.horizontalContainer]}>
                      <View style={[styles.fgArtCoverContainer,styles.miniFgArtworkContainer]}>
                       <Image style={[styles.fgArtCoverImage]}
                        source={ this._getCurrentTrackArtwork() ?
                         {uri:this._getCurrentTrackArtwork()} :
                         require('../assets/empty_album.png')
                        }
                        resizeMode={'contain'}
                       />
                     </View>
                     <View style={styles.trackInfoContainer}>
                       <TouchableOpacity  onPress={this._onPickerToggle} style={styles.trackRowContainer}>
                         <Text style={tracknameTextStyles} numberOfLines={1} ellipsizeMode={'tail'}>
                          { trackLabelPlaceholder }
                         </Text>
                       </TouchableOpacity>
                       <TouchableOpacity onPress={this._openScUploaderLink} style={styles.trackRowContainer}>
                         <Text style={tracknameTextDescription}>
                           { trackDescription }
                         </Text>
                       </TouchableOpacity>
                     </View>
                    </View>
                  </View>
                  )}
                {this.renderInFullscreen(
                  <View style={tracknameStyles}>
                    <TouchableOpacity  onPress={this._onPickerToggle}>
                      <Text style={tracknameTextStyles} numberOfLines={1} ellipsizeMode={'tail'}>
                       { trackLabelPlaceholder }
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this._openScUploaderLink} >
                      <Text style={tracknameTextDescription}>
                        { trackDescription }
                      </Text>
                    </TouchableOpacity>
                  </View>)}
                {this.renderInFullscreen(this.renderForegroundArtCover())}
                <View style={[styles.horizontalContainer]} >
                  <Text style={[styles.playbackTime,styles.playbackTimeInitial]}>{formatDuration(this.state.elapsed)}</Text>
                  <View style={styles.playbackTrackContainer}>
                    <MultiSlider
                      values={this.state.sliderOneValue}
                      min={0}
                      max={100}
                      onValuesChange={this._onMultiSliderValuesChange}
                      onValuesChangeFinish={this._onSeekToTime}
                      onValuesChangeStart={this._onSeekToTimeStart}
                      sliderLength={progressTrackLength}
                      trackStyle={{ borderRadius: 12, height: 3 }}
                      selectedStyle={{backgroundColor: 'rgb(255,255,255)'}}
                      unselectedStyle={{backgroundColor: 'rgba(255,255,255,0.3)'}}
                      markerStyle={markerStyle} />
                  </View>
                  <Text style={[styles.playbackTime]}>{formatDuration(this.state.duration)}</Text>
                </View>
                <View style={styles.horizontalContainer}>
                  <Button style={[styles.container,styles.playlistButton]}
                      image={require('../assets/flat_select.png')}
                      onPressed={this._toggleCurrentPlaylist} />
                  <Button style={[styles.container,styles.startRow]}
                          image={require('../assets/flat_prev.png')}
                          size={'bigger'}
                          onPressed={this._goToPrevTrack} />
                  <View style={styles.playToggleButtonContainer}>
                    <Button style={playPauseButtonStyle} image={playbackSource}
                        size={'huge'} onPressed={this._onPlayTogglePress} />
                  </View>
                  <Button style={[styles.container,styles.endRow]}
                          image={require('../assets/flat_next.png')}
                          size={'bigger'}
                          onPressed={this._goToNextTrack} />
                  <Button style={[styles.container,styles.searchButton]}
                          image={require('../assets/flat_search.png')}
                          onPressed={this._onPickerToggle}
                          size={'small'}/>
                </View>
                <View style={styles.horizontalContainer}>
                  <View style={styles.volumeSlider}>
                    <Slider step={0.05}
                      thumbImage={require('../assets/flat_dot.png')}
                      minimumTrackTintColor={sliderTrackStyles.min}
                      maximumTrackTintColor={sliderTrackStyles.max}
                      onValueChange={this._onVolumeValueChange}
                      value={this.state.initialSliderValue} />
                  </View>
                </View>
                <TouchableOpacity onPress={this._openScUploaderLink} style={[styles.scCopyContainer]}>
                  <Image
                  style={[styles.scCopyImage]}
                  source={require('../assets/powered_by_large_white.png')}
                  resizeMode={'contain'} />
                </TouchableOpacity>
              </View>
            </Image>
         </View>
      </View>
    );
  }

  renderForegroundArtCover() {
    return <View style={[styles.horizontalContainer,styles.fgArtCoverContainer]}>
      <Image style={[styles.fgArtCoverImage]}
       source={ this._getCurrentTrackArtwork() ?
        {uri:this._getCurrentTrackArtwork()} :
        require('../assets/empty_album.png')
       }
       resizeMode={'contain'}
      />
    </View>
  }
}

AudioPlayerContainer.propTypes = {
//TODO: specify propTypes
};
const mapStateToProps = (state, props) => {
  let player = state.players.filter((player) => player.side === props.side).pop();
  let playlist = state.playlist.filter((playlist) => playlist.side === props.side).pop();
  let isFullscreen = state.mode === props.side;
  let isSplitMode = state.mode === playbackModeTypes.SPLIT;
  return {
    player,
    pan : player.pan,
    muted : player.muted,
    isFullscreen,
    playlist,
    isSplitMode
  }
};
const mapDispatchToProps = (dispatch, props) => {
  return {
    onSongQueued : (trackItem) => dispatch(addPlaylistItem(props.side,trackItem)),
    goToNextTrack: () => dispatch(incrementCurrentPlayIndex(props.side)),
    goToPrevTrack: () => dispatch(decrementCurrentPlayIndex(props.side)),
    goToTrack: (trackItem) => dispatch(changeCurrentPlayIndex(props.side,trackItem)),
    pushNotification: (notification) => dispatch(pushNotification(notification))
  };
};
let ConnectedAudioPlayerContainer = connect(mapStateToProps,mapDispatchToProps)(AudioPlayerContainer);

AppRegistry.registerComponent('AudioPlayerContainer', () => ConnectedAudioPlayerContainer);

const volumeMarginSide = 80;
const playbackHorizontalMargin = 10;
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
const lightTextShadowStyle = {
  textShadowColor: '#555',
  textShadowOffset: {width:0,height:0},
  textShadowRadius : 0
};
const styles = StyleSheet.create({
  mainContainer:{
    flex:1
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems:'center'
  },
  startRow: {
    alignItems:'flex-end'
  },
  endRow:{
    alignItems:'flex-start'
  },
  backgroundOverlay : {
    flex:1,
    backgroundColor:THEME.textOverlayBgColor
  },
  horizontalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tracknameContainer:{
    flex:2,
    paddingTop:20,
    paddingBottom:10,
    flexDirection:'column',
    justifyContent:'center'
  },
  tracknameFullscreen:{
    flex:0,
    height:75
  },
  progressSlider : {
    flex:1,
  },
  playbackTime :{
    textAlign: 'center',
    color: mainFgColor,
    height:30,
    lineHeight: 22,
    width:50
  },
  playbackTimeInitial:{
    marginLeft:10
  },
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
  playToggleButtonContainer:{
    borderWidth:1.5,
    borderRadius:50,
    height:60,
    width:60,
    top:-10,
    borderColor:'rgba(255,255,255,0.5)',
    marginHorizontal:10
  },
  playToggleButton:{
    top:6,
    left:3
  },
  pauseToggleButton:{
    top:5,
    left:-1
  },
  searchButton:{
    top:5
  },
  scCopyContainer :{
    position:'absolute',
    bottom:10,
    right:10,
    zIndex :10
  },
  scCopyImage:{
    width:45,
    height:45
  },
  playlistButton:{
    top:5
  },
  trackInfoContainer:{
    flex:2,
    justifyContent:'center'
  },
  trackRowContainer:{
    height:25
  },
  trackname : {
    fontSize: 16,
    fontWeight: '600',
    color: mainFgColor,
    backgroundColor: 'transparent',
    paddingRight:20
  },
  trackDescription:{
    fontSize: 14,
    fontWeight: '600',
    color: THEME.scAuthorColor
  },
  tracknameTextFullscreen:{
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    paddingLeft:20,
    paddingRight:20,
    height: 30
  },
  trackDescriptionTextFullscreen:{
    fontSize: 16,
    textAlign: 'center',
    height: 40,
  },
  artwork : {
    justifyContent: 'center',
    flexDirection:'row',
    flex:1
  },
  artworkImage : {
    flex:1,
    width:null,
    height:null,
    backgroundColor:artworkPlaceholderColor
  },
  fgArtCoverImage :{
    flex:1,
    width:null,
    height:null,
  },
  fgArtCoverContainer:{
    flex:5,
    borderColor:THEME.contentBorderColor,
    paddingBottom: 20
  },
  miniFgArtworkContainer:{
    flex:1,
    paddingBottom:0,
    paddingLeft:5
  }
});
const sliderTrackStyles = {
  max : 'rgba(255,255,255,0.3)',
  min : mainFgColor
};
const markerStyle = {
  height:17,
  width:4,
  borderRadius: 2,
  backgroundColor:THEME.mainHighlightColor,
  borderWidth: 0,
  shadowColor:'black',
  shadowRadius:0,
  shadowOffset: { width:0,height:2},
  shadowOpacity: 0
};
export default ConnectedAudioPlayerContainer;
