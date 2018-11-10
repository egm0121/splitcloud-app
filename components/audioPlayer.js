import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  Slider,
  Image,
  View,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import THEME from '../styles/variables';
import {
  audioPlayerStates,
  playbackModeTypes, 
  FEATURE_SHUFFLE,
  FEATURE_REPEAT,
  FEATURE_SUGGESTED,
} from '../helpers/constants';
import { ifIphoneX } from 'react-native-iphone-x-helper';

import Button from '../components/button';
import AppText from '../components/appText';
import ToggleFavoriteTrackContainer from '../containers/toggleFavoriteTrackContainer';
import FeatureDiscoveryContainer from '../containers/featureDiscoveryContainer';
import MultiSlider from 'react-native-multi-slider';
import { formatDurationExtended, getArtworkImagePath, isLocalTrack } from '../helpers/formatters';

const isBufferingLabel = 'Buffering - ';

class AudioPlayer extends Component {
  constructor(props){
    super(props);
  } 
  componentWillUnmount(){
    console.log('component will unmount! destory player instance')
    if(this.playerAObj){
      this.playerAObj.stop();
      this.playerAObj.destroy();
    }
  }
  _getCurrentTrackIndex(){
    return this.props.playbackIndex;
  }
  _hasCurrentTrackObj(){
    return this.props.queue[this.props.playbackIndex];
  }
  _getCurrentTrackObj(){
    return this.props.queue[this.props.playbackIndex] || {};
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
    return this._getCurrentTrackObj().username;
  }
  _getCurrentTrackArtwork(){
    if( isLocalTrack(this._getCurrentTrackObj()) 
      && this._getCurrentTrackObj().artwork){
      return getArtworkImagePath(this._getCurrentTrackObj().artwork);
    }
    const scArtwork = this._getCurrentTrackObj().artwork ?
      this._getCurrentTrackObj().artwork.replace('-large', '-t500x500') : null;
    return scArtwork || false;
  }
  _getFallbackTrackArtwork(){
    return this.props.side == playbackModeTypes.LEFT ?
      require('../assets/empty_album.png'):
      require('../assets/empty_album_alt.png');
  }
  _isPlayerBuffering(){
    return this.props.status === audioPlayerStates.BUFFERING;
  }
  _isPlayerPlaying(){
    return this.props.status === audioPlayerStates.PLAYING;
  }
  _isPlayerPaused(){
    return this.props.status === audioPlayerStates.PAUSED;
  }
  _isPlayerStopped(){
    return this.props.status === audioPlayerStates.STOPPED;
  }
  _isSoundCloudTrack(){
    return !!this._getCurrentTrackObj().scUploaderLink;
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
    let isUiPlaybackActive = this._isPlayerPlaying() || this._isPlayerBuffering();
    let playbackSource = isUiPlaybackActive ?
      require('../assets/flat_pause.png') : require('../assets/flat_play.png');
    let playPauseButtonStyle = [styles.container];
    playPauseButtonStyle.push(isUiPlaybackActive ?
      styles.pauseToggleButton : styles.playToggleButton);

    let {width} = Dimensions.get('window');
    let progressTrackLength = width - 160;
    let volumeSliderWidth = width - 160;
    let showBgArtCover = this._getCurrentTrackArtwork();
    let artworkSource = showBgArtCover ?
      {uri:this._getCurrentTrackArtwork()} :
      this._getFallbackTrackArtwork();
    let tracknameStyles = [styles.tracknameContainer];
    let tracknameTextStyles = [styles.trackname];
    let tracknameTextDescription = [styles.trackDescription];
    let playbackControlsContainer = [styles.horizontalContainer];
    let playerBgImage = [styles.artworkImage];
    if(this.props.isFullscreen){
      tracknameStyles.push(styles.tracknameFullscreen)
      tracknameTextStyles.push(styles.tracknameTextFullscreen)
      tracknameTextDescription.push(styles.trackDescriptionTextFullscreen)
      playbackControlsContainer.push(styles.controlsBackground);
    }
    let trackDescription = '';
    let trackLabelPlaceholder = 'Tap to load ' + sideLabel[this.props.side] + ' track...';
    let smallTimeText = undefined;

    if(formatDurationExtended(this.props.duration).length > 5){
      smallTimeText = styles.playbackTimeSmall;
      progressTrackLength -= 20;
    }
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
              source={artworkSource}
              resizeMode={'cover'}>
              <View style={styles.backgroundOverlay}>
                  {this.renderInSplitMode(
                  <View style={[tracknameStyles]}>
                    <View style={[styles.horizontalContainer]}>
                      <TouchableOpacity  
                        style={[styles.fgArtCoverContainer,styles.miniFgArtworkContainer]}
                        onPress={this.props.toggleCurrentPlaylist}>
                          <FeatureDiscoveryContainer featureName={FEATURE_SUGGESTED} style={styles.featureSuggestedDot} />
                          <Image style={[styles.fgArtCoverImage,styles.miniArtCoverImage]}
                            source={artworkSource}
                            resizeMode={'contain'}>
                          <ToggleFavoriteTrackContainer 
                              side={this.props.side} 
                              track={this._getCurrentTrackObj()} 
                              style={[styles.favoriteToggleCenteredPosition]}
                              size={'small'}
                            />
                          </Image>
                        </TouchableOpacity>
                     <View style={styles.trackInfoContainer}>
                       <TouchableOpacity  onPress={this.props.onTrackLabelPress} style={styles.trackRowContainer}>
                         <AppText bold={true} style={tracknameTextStyles} numberOfLines={1} ellipsizeMode={'tail'}>
                          { trackLabelPlaceholder }
                         </AppText>
                       </TouchableOpacity>
                       <TouchableOpacity onPress={this.props.onUploaderProfileOpen} style={styles.trackRowContainer}>
                         <AppText bold={true} style={tracknameTextDescription} numberOfLines={1} ellipsizeMode={'tail'} >
                           { trackDescription }
                         </AppText>
                       </TouchableOpacity>
                       {this._isSoundCloudTrack() && <TouchableOpacity onPress={this.props.openScUploaderLink}>
                          <Image
                          style={[styles.scCopyInlineImage]}
                          source={require('../assets/soundcloud_gray_logo.png')}
                          resizeMode={'contain'} />
                      </TouchableOpacity>}
                     </View>
                    </View>
                  </View>
                  )}
                {this.renderInFullscreen(
                  <View style={tracknameStyles}>
                    <TouchableOpacity onPress={this.props.onTrackLabelPress}>
                      <AppText bold={true} style={tracknameTextStyles} numberOfLines={1} ellipsizeMode={'tail'}>
                       { trackLabelPlaceholder }
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.props.onUploaderProfileOpen} numberOfLines={1} ellipsizeMode={'tail'} >
                      <AppText bold={true} style={tracknameTextDescription}>
                        { trackDescription }
                      </AppText>
                    </TouchableOpacity>
                  </View>)}
                {this.renderInFullscreen(this.renderForegroundArtCover(artworkSource))}
                <View style={playbackControlsContainer.concat([styles.verticalCenterContainer])} >
                  <AppText style={[styles.playbackTime,styles.playbackTimeInitial,smallTimeText]}>{
                      formatDurationExtended(this.props.elapsed)
                  }</AppText>
                  <View style={styles.playbackTrackContainer}>
                    <MultiSlider
                      values={this.props.playbackProgressValue}
                      min={0}
                      max={100}
                      onValuesChangeFinish={this.props.onSeekToTime}
                      onValuesChangeStart={this.props.onSeekToTimeStart}
                      sliderLength={progressTrackLength}
                      trackStyle={{ borderRadius: 4, height: 2 }}
                      selectedStyle={{backgroundColor: 'rgb(255,255,255)'}}
                      unselectedStyle={{backgroundColor: 'rgba(255,255,255,0.3)'}}
                      markerStyle={markerStyle} />
                  </View>
                  <AppText style={[styles.playbackTime,smallTimeText]}>{
                      formatDurationExtended(this.props.duration)
                    }</AppText>
                </View>
                <View style={playbackControlsContainer.concat([styles.verticalCenterContainer])}>
                  <Button style={[styles.container,styles.playlistButton]}
                      image={require('../assets/flat_select.png')}
                      size={'small'}
                      onPressed={this.props.toggleFavoritePlaylist} />
                  <Button style={[styles.container,styles.startRow]}
                          image={require('../assets/flat_prev.png')}
                          onPressed={this.props.goToPrevTrack} />
                  <View style={styles.playToggleButtonContainer}>
                    <Button style={playPauseButtonStyle} image={playbackSource}
                        size={'big'} onPressed={this.props.onPlayTogglePress} />
                  </View>
                  <Button style={[styles.container,styles.endRow]}
                          image={require('../assets/flat_next.png')}   
                          onPressed={this.props.goToNextTrack} />
                  <Button style={[styles.container,styles.searchButton]}
                          image={require('../assets/flat_search.png')}
                          onPressed={this.props.onPickerToggle}
                          size={'small'}/>
                </View>
                <View style={playbackControlsContainer.concat([styles.verticalCenterContainer])}>
                  {this.renderShuffleButton()}
                  <View style={[styles.volumeSlider]}>
                    <Slider step={0.05}
                      thumbImage={require('../assets/flat_dot.png')}
                      minimumTrackTintColor={sliderTrackStyles.min}
                      maximumTrackTintColor={sliderTrackStyles.max}
                      onValueChange={this.props.onVolumeValueChange}
                      value={this.props.volumeSliderValue} />
                  </View>
                  <View style={styles.volumePad}>
                    {this.renderRepeatButton()}
                  </View>
                </View>
              </View>
            </Image>
         </View>
      </View>
    );
  }
  renderForegroundArtCover(artworkSource) {
    let {width} = Dimensions.get('window');
    const resizeStyle = {
      flex:0,
      width: width - 60,
      height: width - 60
    };
    
    return <Image style={[styles.controlsFadeImage]}
        source={require('../assets/fade_to_black.png')}
        resizeMode={'stretch'} >
          <TouchableOpacity onPress={this.props.toggleCurrentPlaylist}>
            <FeatureDiscoveryContainer featureName={FEATURE_SUGGESTED} style={styles.featureSuggestedDot} />
            <Image style={[styles.fgArtCoverImage,resizeStyle]}
              source={artworkSource} >
              {this._isSoundCloudTrack() && <View style={styles.scCopyContainerWrapper}>
                <TouchableOpacity onPress={this.props.openScUploaderLink} style={styles.scCopyContainer}>
                    <Image
                    style={[styles.scCopyImage]}
                    source={require('../assets/soundcloud_white_logo.png')}
                    resizeMode={'contain'} />
                </TouchableOpacity>
              </View>}
              <View style={styles.toggleFavoriteBtnContainer} >
                <ToggleFavoriteTrackContainer 
                  side={this.props.side} 
                  track={this._getCurrentTrackObj()}
                  style={[styles.toggleFavoriteBtn]} 
                />
              </View>
            </Image>
          </TouchableOpacity>
      </Image>
  }
  renderShuffleButton(){
    const image = this.props.playlist.shuffle ? 
      require('../assets/flat_rand.png') :
      require('../assets/flat_rand_off.png');
    return <View style={styles.volumePad}>
      <FeatureDiscoveryContainer featureName={FEATURE_SHUFFLE} style={styles.featureShuffleDot} />
      <Button style={styles.shuffleBtn} size={'tiny'} image={image} onPressed={this.props.onShuffleModeToggle} />
    </View>;
  }
  renderRepeatButton(){
    const image = this.props.repeat ? 
      require('../assets/flat_repeat.png') :
      require('../assets/flat_repeat_off.png');
    return <View style={styles.volumePad}>
      <Button style={styles.repeatBtn} size={'tiny'} image={image} onPressed={this.props.onRepeatToggle} />
      <FeatureDiscoveryContainer featureName={FEATURE_REPEAT} style={styles.featureRepeatDot} />
    </View>
  }
}

AudioPlayer.propTypes = {
  side : PropTypes.string,
  playbackIndex : PropTypes.number,
  queue : PropTypes.array,
  status : PropTypes.string,
  elapsed : PropTypes.number,
  duration : PropTypes.number,
  pan : PropTypes.number,
  muted : PropTypes.number,
  repeat : PropTypes.bool,
  isFullscreen : PropTypes.bool,
  playbackProgressValue : PropTypes.array,
  volumeSliderValue : PropTypes.number,
  onPickerToggle : PropTypes.func,
  onUploaderProfileOpen : PropTypes.func,
  onSeekToTimeStart : PropTypes.func,
  onSeekToTime : PropTypes.func,
  toggleCurrentPlaylist: PropTypes.func,
  onMultiSliderValuesChange :  PropTypes.func,
  goToPrevTrack : PropTypes.func,
  onPlayTogglePress : PropTypes.func,
  goToNextTrack : PropTypes.func,
  onVolumeValueChange : PropTypes.func,
  openScUploaderLink : PropTypes.func ,
  onShuffleModeToggle : PropTypes.func,
  onRepeatToggle : PropTypes.func
};

const volumeMarginSide = 80;
const playbackHorizontalMargin = 10;
const mainFgColor = '#FFFFFF';
const overImageShadowColor = 'rgb(0,0,0)';
const overImageShadowOffset = {width:1,height:1};
const overImageShadowRadious = 8;
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
    flexDirection: 'row'
  },
  verticalCenterContainer:{
    alignItems:'center'
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
    ...ifIphoneX(
      {paddingTop:75},
      {paddingTop:35}
    ),
    height:100
  },
  progressSlider : {
    flex:1,
  },
  playbackTime :{
    textAlign: 'center',
    color: mainFgColor,
    height:30,
    fontSize:16,
    fontWeight: 'bold',
    lineHeight: 22,
    width:50
  },
  playbackTimeSmall:{
    fontSize:14,
    width:60
  },
  playbackTimeInitial:{
    marginLeft:20
  },
  playbackTrackContainer:{
    marginHorizontal: playbackHorizontalMargin
  },
  volumePad:{
    flex:2,
    flexDirection:'row'
  },
  volumeSlider:{
    flex:3,
    justifyContent: 'center',
  },
  welcome: Object.assign({
    fontSize: 20,
    textAlign: 'center',
    color: mainFgColor,
    margin: 10,
    height: 30
  },textShadowStyle),
  playToggleButtonContainer:{
    borderWidth:0,
    borderRadius:50,
    height:55,
    width:55,
    borderColor:'rgba(255,255,255,0.3)',
    marginHorizontal:10
  },
  playToggleButton:{
    top:10,
    left:4
  },
  pauseToggleButton:{
    top:10,
    left:-1
  },
  searchButton:{
    alignItems:'flex-end',
    paddingRight:20
  },
  toggleFavoriteBtnContainer:{
    flex:1,
    flexDirection:'row',
    alignItems:'flex-end'
  },
  toggleFavoriteBtn: {
    flex:0,
  },
  scCopyContainerWrapper: {
    flex:1,
  },
  scCopyContainer:{
    borderRadius:22,
    borderTopLeftRadius:0,
    borderTopRightRadius:0,
    padding:5,
    paddingTop:4,
    alignItems:'center',
    width:45,
    height:35,
    backgroundColor:THEME.imageTextOverlayBgColor,
  },
  scCopyImage:{
    height:18,
  },
  scCopyInlineImage:{
    width:30,
    height:20
  },
  shuffleBtn:{
    flex:1,
    alignItems:'flex-start',
    paddingLeft:22
  },
  repeatBtn: {
    flex:1,
    alignItems:'flex-end',
    paddingRight:22
  },
  featureShuffleDot:{
    top:4,
  },
  featureRepeatDot:{
    left:-18,
    top:4
  },
  featureSuggestedDot:{
    left:-18,
    top:-2  
  },
  playlistButton:{
    alignItems:'flex-start',
    paddingLeft:20
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
    color: mainFgColor,
    backgroundColor: 'transparent',
    paddingRight:20
  },
  trackDescription:{
    fontSize: 14,
    color: THEME.scAuthorColor
  },
  tracknameTextFullscreen:{
    fontSize: 19,
    lineHeight: 25,
    textAlign: 'center',
    paddingLeft:20,
    paddingRight:20,
    height: 35
  },
  trackDescriptionTextFullscreen:{
    fontSize: 16,
    textAlign: 'center',
    height: 30,
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
    backgroundColor:'#121314'
  },
  controlsFadeImage:{
    flex:5,
    marginBottom:-2,
    width:null,
    height:null,
    alignItems:'center',
    justifyContent:'center' 
  },
  controlsBackground:{
    backgroundColor: THEME.playerControlsBgColor
  },
  fgArtCoverImage :{
    flex:1,
    width:null,
    height:null,
    flexDirection:'column',
    alignItems:'center',
    borderRadius:8
  },
  miniArtCoverImage:{
    justifyContent:'center'
  },
  miniFgArtworkContainer:{
    flex:1,
    paddingLeft:20,
    paddingRight:20
  }
});
const sliderTrackStyles = {
  max : 'rgba(255,255,255,0.3)',
  min : mainFgColor
};
const markerStyle = {
  height:12,
  width:12,
  borderRadius: 6,
  backgroundColor:THEME.mainHighlightColor,
  borderWidth: 0,
  shadowColor:'black',
  shadowRadius:0,
  shadowOffset: { width:0,height:2},
  shadowOpacity: 0
};
export default AudioPlayer;
