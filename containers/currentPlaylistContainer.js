/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  ListView,
  Image,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Alert
} from 'react-native';
import config from '../helpers/config';
import { connect } from 'react-redux';
import TrackList from '../components/trackList';
import BackButton from  '../components/backButton';
import ClearPlaylistButton from '../components/clearPlaylistButton';
import Button from '../components/button';
import FilterInput from '../components/filterInput';
import MenuOverlay from '../components/menuOverlay';
import MenuOverlayItem from '../components/menuOverlayItem';
import {globalSettings,animationPresets} from '../helpers/constants';
import {removeQueuedTrack, setPlaylist} from '../redux/actions/currentPlaylistActions';
import {setGlobalSetting} from '../redux/actions/settingsActions';
import {pushNotification} from  '../redux/actions/notificationActions';
import {formatDuration,formatSidePlayerLabel,ucFirst} from '../helpers/formatters';
import THEME from '../styles/variables';

class CurrentPlaylistContainer extends Component {
  constructor(props){
    super(props);
    this._markAsCurrentTrack = this._markAsCurrentTrack.bind(this);
    this.onTrackDescRender = this.onTrackDescRender.bind(this);
    this.onClearPlaylist = this.onClearPlaylist.bind(this);
    this.onFilterTextChange = this.onFilterTextChange.bind(this);
    this._filterMatchingTracks = this._filterMatchingTracks.bind(this);
    this.onClearFilter = this.onClearFilter.bind(this);
    this.onOverlayClosed = this.onOverlayClosed.bind(this);
    this.onPlaylistMenuOpen  = this.onPlaylistMenuOpen.bind(this);
    this.onOfflineModeToggle = this.onOfflineModeToggle.bind(this);
    this.toggleOfflineModeSetting = this.toggleOfflineModeSetting.bind(this);

    this.state = {
      filterListValue : '',
      isOverlayMenuOpen:false
    }
  }
  _markAsCurrentTrack(item){
    const currTrack =
      this.props.playlist.tracks[this.props.playlist.currentTrackIndex] || {};
    if(item.id == currTrack.id){
      return {
        ...item,
        isCurrentTrack : true
      }
    }
    return item;
  }
  onTrackDescRender(rowData){
    return rowData.duration ?
      `${formatDuration(rowData.duration,{milli:true})} • ${rowData.username}` :
      rowData.username ;
  }
  onClearPlaylist(){
    Alert.alert(
      `Clear ${ucFirst(formatSidePlayerLabel(this.props.side))} Playlist`,
      `This will remove all tracks from your ${formatSidePlayerLabel(this.props.side)} playlist` ,
      [
        { text: 'Clear All',
          onPress: () =>{
            this.props.onClearPlaylist();
            this.onOverlayClosed();
          }, style:'destructive'},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      ]
    )
  }
  onPlaylistMenuOpen(){
    LayoutAnimation.configureNext(animationPresets.overlaySlideInOut);
    this.setState({isOverlayMenuOpen :true});
  }
  onFilterTextChange(text){
    this.setState({filterListValue:text});
  }
  onClearFilter(){
    this.setState({filterListValue:''});
  }
  onOverlayClosed(){
    LayoutAnimation.configureNext(animationPresets.overlaySlideInOut);
    this.setState({isOverlayMenuOpen:false});
  }
  toggleOfflineModeSetting(){
    this.props.setGlobalSetting(
       globalSettings.OFFLINE_MODE,!this.props.settings.offlineMode
    );
    this.onOverlayClosed();
  }
  onOfflineModeToggle(){
    if(!this.props.settings.offlineMode) return this.toggleOfflineModeSetting();
    Alert.alert(
      'Disable Offline Mode',
      'This will remove all local music from your device. Are you sure?' ,
      [
        { text: 'Yes',
          onPress: this.toggleOfflineModeSetting,
          style:'destructive'
        },
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      ]
    );
  }
  _filterMatchingTracks(track){
    if(!this.state.filterListValue.length) return true;
    let matchString = track.label.toLowerCase() + '' + track.username.toLowerCase();
    return matchString.indexOf(this.state.filterListValue.toLowerCase()) != -1;
  }
  render() {
    const overlayStyle = this.state.isOverlayMenuOpen ? {height:250} : {height:0};
    const playlistTracksData = this.props.playlist.tracks
      .filter(this._filterMatchingTracks)
      .map(this._markAsCurrentTrack);
    return (
      <View style={styles.container}>
        <View style={styles.sectionTitleView}>
          <BackButton onPressed={this.props.onClose} style={styles.closeButton}/>
          <Text style={styles.sectionTitle}>{this.props.playlistTitle}</Text>

          <Button
            size="small"
            style={styles.playlistMenuButton}
            image={require('../assets/menu_dots_vertical.png')}
            onPressed={this.onPlaylistMenuOpen} ></Button>
        </View>
        <View style={styles.filterContainerView}>
          <FilterInput
            placeholder={'Filter songs...'}
            value={this.state.filterListValue}
            onChangeText={this.onFilterTextChange}
            onClearFilter={this.onClearFilter}
            />
        </View>
        <TrackList
            tracksData={playlistTracksData}
            onTrackAction={this.props.onRemoveTrack}
            onTrackDescRender={this.onTrackDescRender}
            onTrackActionRender={(rowData) => '×'}
            trackActionStyles={[{fontSize:45}]}
            highlightProp={'isCurrentTrack'}
            {...this.props}
            />
            <MenuOverlay onClose={this.onOverlayClosed}
               closeLabel={'Close'}
               overlayStyle={[styles.playlistMenuOverlay,overlayStyle]}>
              <MenuOverlayItem
                onPress={this.onClearPlaylist} >
                {`Clear ${ucFirst(formatSidePlayerLabel(this.props.side))} Playlist`}
              </MenuOverlayItem>
              <MenuOverlayItem onPress={this.onOfflineModeToggle}>
                {this.props.settings.offlineMode ?
                  'Disable Offline Mode':
                  'Enable Offline Mode'
                }
              </MenuOverlayItem>
            </MenuOverlay>
      </View>
    );
  }
}
CurrentPlaylistContainer.propTypes = {
  side : PropTypes.string.isRequired,
  playlist : PropTypes.object.isRequired,
  playlistTitle : PropTypes.string.isRequired,
  onTrackSelected: PropTypes.func.isRequired,
  onRemoveTrack: PropTypes.func,
  onClose: PropTypes.func
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F50'
  },
  sectionTitle : {
    color: THEME.mainHighlightColor,
    fontSize: 16,
    fontWeight:'600'
  },
  iconText:{
    color: THEME.mainHighlightColor,
    fontSize: 16,
    fontWeight:'600'
  },
  playlistMenuButton: {
    position:'absolute',
    right:0,
    top:24,
    zIndex:10,
    height:30,
    paddingHorizontal:10
  },
  closeButton :{
    position:'absolute',
    left:0,
    paddingLeft:10,
    top:20
  },
  sectionTitleView :{
    alignItems: 'center',
    height: 60,
    paddingTop: 27,
    backgroundColor: THEME.mainBgColor,
    borderColor : THEME.contentBorderColor,
    borderBottomWidth :2
  },
  filterContainerView :{
    height: 50,
    paddingTop:5,
    paddingHorizontal:10,
    paddingBottom:10,
    backgroundColor: THEME.contentBgColor
  },
  playlistMenuOverlay: {
    height:300
  }
});
const mapStateToProps = (state,props) => {
  const pickerState =
    state.songPickers.filter((playlist) => playlist.side == props.side).pop();
  const playlistState = state.playlist.filter((playlist) => playlist.side === props.side).pop();
  return {
    picker : pickerState,
    playlist : playlistState,
    settings : state.settings
  };
}
const mapDispatchToProps = (dispatch,props) => ({
  setGlobalSetting(key,value){
    dispatch(setGlobalSetting(key,value));
  },
  onRemoveTrack(track){
    dispatch(removeQueuedTrack(props.side,track));
    dispatch(pushNotification({message:'Removed Track!',type:'success'}));
  },
  onClearPlaylist(){
    dispatch(setPlaylist(props.side,[]));
    dispatch(pushNotification({message:'Cleared Playlist!',type:'success'}));
  },
  pushNotification(notification){
    dispatch(pushNotification(notification));
  }
});
const ConnectedCurrentPlaylistContainer = connect(mapStateToProps,mapDispatchToProps)(CurrentPlaylistContainer);

AppRegistry.registerComponent('CurrentPlaylistContainer', () => ConnectedCurrentPlaylistContainer);

export default ConnectedCurrentPlaylistContainer;
