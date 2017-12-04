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
import TrackListContainer from '../containers/trackListContainer';
import BackButton from  '../components/backButton';
import ClearPlaylistButton from '../components/clearPlaylistButton';
import Button from '../components/button';
import FilterInput from '../components/filterInput';
import MenuOverlay from '../components/menuOverlay';
import MenuOverlayItem from '../components/menuOverlayItem';
import HeaderBar from '../components/headerBar';
import {globalSettings,animationPresets} from '../helpers/constants';
import {
   setPlaylist,
   filterPlaylist,
   changeCurrentPlayIndex
} from '../redux/actions/currentPlaylistActions';
import {setGlobalSetting} from '../redux/actions/settingsActions';
import {pushNotification} from  '../redux/actions/notificationActions';
import {formatDuration,formatSidePlayerLabel,ucFirst} from '../helpers/formatters';
import THEME from '../styles/variables';

class CurrentPlaylistContainer extends Component {
  constructor(props){
    super(props);
    this.onClearPlaylist = this.onClearPlaylist.bind(this);
    this.onFilterTextChange = this.onFilterTextChange.bind(this);
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
  onClearPlaylist(){
    Alert.alert(
      `Clear ${ucFirst(formatSidePlayerLabel(this.props.side))} Favorites?`,
      `This will remove all tracks from your ${formatSidePlayerLabel(this.props.side)} playlist` ,
      [
        { text: 'Clear All',
          onPress: ()=>{
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
    this.props.onFilterChange(text);
  }
  onClearFilter(){
    this.props.onFilterChange('');
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
      'This will remove all saved music from your device. Are you sure?' ,
      [
        { text: 'Yes',
          onPress: this.toggleOfflineModeSetting,
          style:'destructive'
        },
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      ]
    );
  }
  render() {
    const overlayStyle = this.state.isOverlayMenuOpen ? {height:250} : {height:0};
    console.log('currentPlaylistContainer unfiltered track',this.props.queue )
    const playlistFilteredList = this.props.queue
      .filter((track) => 'isVisible' in track ? track.isVisible : true);
    return (
      <View style={styles.container}>
        <HeaderBar title={this.props.playlistTitle}>
          <BackButton onPressed={this.props.onClose} style={styles.closeButton}/>
          <Button
            size="small"
            style={styles.playlistMenuButton}
            image={require('../assets/menu_dots_vertical.png')}
            onPressed={this.onPlaylistMenuOpen} ></Button>
        </HeaderBar>
        <View style={styles.filterContainerView}>
          <FilterInput
            placeholder={'Filter songs...'}
            value={this.props.playlist.filterTracks}
            onChangeText={this.onFilterTextChange}
            onClearFilter={this.onClearFilter}
            />
        </View>
        <TrackListContainer
            {...this.props}
            trackList={playlistFilteredList}
            onTrackSelected={this.props.onPlayTrack}
            side={this.props.side}
            trackActionStyles={[{fontSize:45}]}
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
  onRemoveTrack: PropTypes.func,
  onClose: PropTypes.func
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  iconText:{
    color: THEME.mainHighlightColor,
    fontSize: 16,
    fontWeight:'600'
  },
  playlistMenuButton: {
    position:'absolute',
    right:0,
    top:14,
    zIndex:10,
    height:30,
    paddingHorizontal:10
  },
  closeButton :{
    position:'absolute',
    left:0,
    paddingLeft:10,
    top:10
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
    state.songPickers.find((playlist) => playlist.side == props.side);
  const playlistState = state.playlist.find((playlist) => playlist.side === props.side);
  const playlistStore = state.playlistStore.find(playlistStore => playlistStore.id == 'default_'+props.side);
  const queue = playlistStore.tracks;
  return {
    picker : pickerState,
    playlist : playlistState,
    settings : state.settings,
    queue,
    playlistStore
  };
}
const mapDispatchToProps = (dispatch,props) => {
  const defaultPlaylist = 'default_'+props.side;
  return {
    setGlobalSetting(key,value){
      dispatch(setGlobalSetting(key,value));
    },
    onFilterChange(value){
      dispatch(filterPlaylist(props.side,value,defaultPlaylist));
    },
    onPlayTrack(track){
      dispatch(changeCurrentPlayIndex(props.side,track,defaultPlaylist));
    },
    onClearPlaylist(){
      dispatch(setPlaylist(props.side,[],defaultPlaylist));
      dispatch(pushNotification({message:'Cleared Playlist!',type:'success'}));
    },
    pushNotification(notification){
      dispatch(pushNotification(notification));
    }
  };
};
const ConnectedCurrentPlaylistContainer = connect(mapStateToProps,mapDispatchToProps)(CurrentPlaylistContainer);

AppRegistry.registerComponent('CurrentPlaylistContainer', () => ConnectedCurrentPlaylistContainer);

export default ConnectedCurrentPlaylistContainer;
