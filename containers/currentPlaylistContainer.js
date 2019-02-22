/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  LayoutAnimation,
  Alert
} from 'react-native';
import config from '../helpers/config';
import AnalyticsService from '../modules/Analytics';
import { connect } from 'react-redux';
import TrackListContainer from '../containers/trackListContainer';
import ShareAppScreen from '../components/shareAppScreen';
import BackButton from  '../components/backButton';
import Button from '../components/button';
import FilterInput from '../components/filterInput';
import MenuOverlay from '../components/menuOverlay';
import MenuOverlayItem from '../components/menuOverlayItem';
import HeaderBar from '../components/headerBar';
import SoundCloudApi from '../modules/SoundcloudApi';
import RelatedTrackPreviewContainer from './relatedTrackPreviewContainer';
import { globalSettings, animationPresets } from '../helpers/constants';
import {
   setPlaylist,
   filterPlaylist,
   changeCurrentPlayIndex
} from '../redux/actions/currentPlaylistActions';
import {setGlobalSetting} from '../redux/actions/settingsActions';
import {pushNotification} from  '../redux/actions/notificationActions';
import {formatSidePlayerLabel, ucFirst, isLocalTrack} from '../helpers/formatters';
import THEME from '../styles/variables';
import NavigationStateNotifier from '../modules/NavigationStateNotifier';
import {
  playlistType,
  RESERVED_PLAYLIST_NAME,
  FEATURE_SC_EXPORT,
  FEATURE_SOCIAL_SHARE,
} from '../helpers/constants';
import FeatureDiscoveryContainer from '../containers/featureDiscoveryContainer';
import { markFeatureDiscovery } from '../redux/actions/featureDiscoveryActions';
import { getCurrentTrackBySide } from '../redux/selectors/playlistSelector';
class CurrentPlaylistContainer extends Component {
  constructor(props){
    super(props);
    this.onClearPlaylist = this.onClearPlaylist.bind(this);
    this.onFilterTextChange = this.onFilterTextChange.bind(this);
    this.onClearFilter = this.onClearFilter.bind(this);
    this.onOverlayClosed = this.onOverlayClosed.bind(this);
    this.onPlaylistMenuOpen  = this.onPlaylistMenuOpen.bind(this);
    this.onOfflineModeToggle = this.onOfflineModeToggle.bind(this);
    this.onExportToScPlaylist = this.onExportToScPlaylist.bind(this);
    this.onShareScreen = this.onShareScreen.bind(this);
    this.componentDidFocus = this.componentDidFocus.bind(this);
    this.toggleOfflineModeSetting = this.toggleOfflineModeSetting.bind(this);
    this.scApi = new SoundCloudApi({ 
      clientId: config.SC_CLIENT_ID,
      clientSecret: config.SC_CLIENT_SECRET,
      redirectUri: config.SC_OAUTH_REDIRECT_URI
    });
    this.focusSub = NavigationStateNotifier.addListener(
      this.props.routeName,
      this.componentDidFocus
    );
    
    this.state = {
      isOverlayMenuOpen:false
    };
  }
  componentDidFocus(route){
    console.log('CurrentPlayerContainer did focus scroll to selected song');
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
  onExportToScPlaylist(){
    let idList = this.props.queue
      .filter(t => t.provider !== 'library').map(({id}) => id);
    if( !idList.length ){ 
      this.props.pushNotification({
        type: 'info',
        message: 'Playlist is empty'
      });
      return;
    }
    this.scApi.authenticate().then(() => {
      this.props.pushNotification({type: 'info', message: 'Connecting to SoundCloud...'});
      this.scApi.getOwnPlaylists().then((playlists) => {
        const hasSplitcloudSet = playlists
          .filter(t => t.label == RESERVED_PLAYLIST_NAME)[0];
        console.log('found a splitcloud playlist',hasSplitcloudSet);
        return hasSplitcloudSet;
      }).then( playlist => {
        return playlist ? 
          this.scApi.updatePlaylist(playlist.id,idList) :
          this.scApi.createPlaylist(RESERVED_PLAYLIST_NAME,idList)
      }).then(resp => {
        this.props.pushNotification({
          type:'success',
          message: `${idList.length} tracks saved on SoundCloud`
        });
        AnalyticsService.sendEvent({
          category: 'side-'+this.props.side,
          action: FEATURE_SC_EXPORT,
          label: 'ui-action',
          value:1
        })
      })
      .catch(err => {
        this.props.pushNotification({
          type:'error',
          message:'There was a login error :('
        });
      });
    });
    this.onOverlayClosed();
  }
  onPlaylistMenuOpen(){
    LayoutAnimation.configureNext(animationPresets.overlaySlideInOut);
    this.setState({isOverlayMenuOpen :true});
    this.props.markFeatureDiscovery(FEATURE_SC_EXPORT);
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
  onShareScreen(){
    this.props.navigator.push({
      title : 'ShareAppScreen',
      name : 'ShareAppScreen',
      component: ShareAppScreen,
      passProps : {
        onClose: () => this.props.navigator.pop()
      }
    });
    this.props.markFeatureDiscovery(FEATURE_SOCIAL_SHARE);
    this.onOverlayClosed();
  }
  hasRelatedTracks(component){
    if(!this.props.currentTrack || isLocalTrack(this.props.currentTrack)) return null;
    return component;
  }
  componentWillUnmount(){
    this.focusSub.off();
  }
  render() {
    const overlayStyle = this.state.isOverlayMenuOpen ? {} : {height:0};
    console.log('currentPlaylistContainer unfiltered track',this.props.queue )
    const playlistFilteredList = this.props.queue
      .filter((track) => 'isVisible' in track ? track.isVisible : true);
    const isUpNextPlaylist = this.props.playlistType === playlistType.UP_NEXT;
    return (
      <View style={styles.container}>
        <HeaderBar title={this.props.playlistTitle}>
          <BackButton onPressed={this.props.onClose} style={styles.closeButton}/>
          {!!this.props.showMenu && 
            <FeatureDiscoveryContainer featureName={FEATURE_SOCIAL_SHARE} style={styles.playlistMenuButton}>
              <Button size="small" 
                image={require('../assets/menu_dots_vertical.png')}
                onPressed={this.onPlaylistMenuOpen} />
            </FeatureDiscoveryContainer>
          }
        </HeaderBar>
        <View style={styles.filterContainerView}>
          <FilterInput
            placeholder={'Filter songs...'}
            value={this.props.playlistFilter}
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
            scrollToCurrentTrack={isUpNextPlaylist}
            />
        <RelatedTrackPreviewContainer 
          navigator={this.props.navigator}
          side={this.props.side}
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
          <MenuOverlayItem onPress={this.onExportToScPlaylist}>
            Save playlist to SoundCloud
          </MenuOverlayItem>
          <FeatureDiscoveryContainer featureName={FEATURE_SOCIAL_SHARE} style={styles.featureMenuMark} />
          <MenuOverlayItem onPress={this.onShareScreen}>
              Share app with friends
          </MenuOverlayItem>
        </MenuOverlay>
      </View>
    );
  }
}
CurrentPlaylistContainer.defaultProps = {
  showMenu : true
};
CurrentPlaylistContainer.propTypes = {
  showMenu : PropTypes.bool, 
  side : PropTypes.string.isRequired,
  playlistId : PropTypes.string.isRequired,
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
    top:14
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
  },
  featureMenuMark:{
    position:'relative',
    top:25,
    left:20
  }
});
const mapStateToProps = (state,props) => {
  const pickerState =
    state.songPickers.find((playlist) => playlist.side == props.side);
  const playlistState = state.playlist.find((playlist) => playlist.side === props.side);
  const playlistStore = state.playlistStore.find(playlistStore => playlistStore.id == props.playlistId);
  const queue = playlistStore.tracks;
  const playlistFilter = playlistStore.filterTracks
  return {
    picker : pickerState,
    playlist : playlistState,
    settings : state.settings,
    queue,
    playlistFilter,
    playlistStore,
    currentTrack: getCurrentTrackBySide(state,props.side)
  };
}
const mapDispatchToProps = (dispatch,props) => {
  const defaultPlaylist = props.playlistId;
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
    },
    markFeatureDiscovery(name){
      dispatch(markFeatureDiscovery(name));
    }
  };
};
const ConnectedCurrentPlaylistContainer = connect(mapStateToProps,mapDispatchToProps)(CurrentPlaylistContainer);

AppRegistry.registerComponent('CurrentPlaylistContainer', () => ConnectedCurrentPlaylistContainer);

export default ConnectedCurrentPlaylistContainer;
