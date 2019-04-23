/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
} from 'react-native';
import config from '../helpers/config';
import THEME from '../styles/variables'
import { connect } from 'react-redux';
import SoundCloudApi from '../modules/SoundcloudApi';
import TrackList from '../components/trackList';
import ToggleFavoriteTrackContainer from './toggleFavoriteTrackContainer';
import PlaylistContainer from './playlistContainer';

import {
  setPreviewTrack
} from '../redux/actions/previewActions';
import {
  pushNotification
} from '../redux/actions/notificationActions';
import {
  setPlaylist,
  changeCurrentPlayIndex
} from '../redux/actions/currentPlaylistActions';
import {
  formatDurationExtended,
  formatNumberPrefix
} from '../helpers/formatters';
import HorizontalTrackListing from '../components/horizontalTrackListing';

const {SC_CLIENT_ID} = config;

class TrackListContainer extends Component {
  constructor(props){
    super(props);
    console.log(
      'TrackListContainer mounted with props',this.props.side
    );
    this.scApi = new SoundCloudApi({clientId: SC_CLIENT_ID});
    this.onTrackActionRender = this.onTrackActionRender.bind(this);
    this.onTrackSelected = this.onTrackSelected.bind(this);
    this.onPlaylistSelected = this.onPlaylistSelected.bind(this);
    console.log('TrackListContainer ',props.onEndThreshold, props.navigator);
  }
  
  hasFavoriteTrack(track){
    return this.props.favoritePlaylist.tracks.find(t => t.id == track.id);
  }
  onTrackActionRender(track){
    if(typeof this.props.onTrackActionRender == 'function'){
      return this.props.onTrackActionRender(track, this.hasFavoriteTrack(track));
    } else {
      return <ToggleFavoriteTrackContainer 
        inlineLayout 
        side={this.props.side}
        track={track}
      />
    }
  }
  onTrackSelected(...args){
    if(args[0].type == 'playlist'){
      if(this.props.onPlaylistSelected){
        return this.props.onPlaylistSelected(...args);
      }
      this.onPlaylistSelected(...args);
    } else {
      this.props.onTrackSelected(...args);
    }
  }
  onPlaylistSelected(playlist){
    console.log('',this.props)
    this.props.navigator.push({
      title : `PlaylistContainer - ${playlist.label} - ${this.props.side}`,
      name : 'PlaylistContainer' + this.props.side,
      component: PlaylistContainer,
      passProps : {
        playlist: playlist,
        side : this.props.side,
        onClose: () => this.props.navigator.pop()
      }
    });
  }
  onTrackDescRender(rowData){
    let duration = rowData.duration ?
        formatDurationExtended(rowData.duration,{milli:true}) : '',
      playCount = rowData.playbackCount ?
        formatNumberPrefix(rowData.playbackCount) : '',
      username = 'by '+rowData.username;
    return [duration,playCount,username].filter(e =>e.length).join(' • ');
  }
  render() {
    if (this.props.layout == 'horizontal') {
      return <HorizontalTrackListing 
        items={this.props.trackList}
        onTrackDescRender={this.onTrackDescRender}
        onTrackActionRender={this.onTrackActionRender}
        onTrackPreviewStart={this.props.onTrackPreviewStart}
        onTrackPreviewEnd={this.props.onTrackPreviewEnd}
        currentTrack={this.props.currentPlayingTrack}
        currentPreviewTrack={this.props.currentPreviewTrack}
        onSelected={this.onTrackSelected}
        onPlaylistSelected={this.onPlaylistSelected}
      />
    }
    return (
      <View style={styles.container}>
        <TrackList
          onHeaderRender={this.props.onHeaderRender}
          tracksData={this.props.trackList}
          onTrackDescRender={this.onTrackDescRender}
          onTrackActionRender={this.onTrackActionRender}
          currentTrack={this.props.currentPlayingTrack}
          currentPreviewTrack={this.props.currentPreviewTrack}
          onTrackSelected={this.onTrackSelected}
          onTrackPreviewStart={this.props.onTrackPreviewStart}
          onTrackPreviewEnd={this.props.onTrackPreviewEnd}
          isLoading={this.props.isLoading}
          onEndReached={this.props.onEndReached}
          onEndThreshold={this.props.onEndThreshold}
          resetToTop={this.props.resetToTop}
          scrollToCurrentTrack={this.props.scrollToCurrentTrack}
          emptyLabel={this.props.emptyLabel}
        ></TrackList>
      </View>
    );
  }
}
TrackListContainer.defaultProps ={
  resetToTop:false,
  layout: 'default',
}
TrackListContainer.propTypes = {
  side : PropTypes.string.isRequired,
  trackList : PropTypes.array.isRequired,
  currentPlayingTrack : PropTypes.object.isRequired,
  resetToTop: PropTypes.bool,
  onTrackActionRender: PropTypes.func,
  onTrackSelected: PropTypes.func.isRequired,
  onPlaylistSelected: PropTypes.func,
  onHeaderRender: PropTypes.func,
  isLoading: PropTypes.bool,
  scrollToCurrentTrack: PropTypes.bool,
  layout: PropTypes.string
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:THEME.mainBgColor
  }
});
const mapStateToProps = (state,props) => {
  let playlist = state.playlist.find((playlist) => playlist.side === props.side);
  let preview = state.preview.find(preview => preview.side === props.side);
  let playlistStore = state.playlistStore.find(
    playlistStore => playlistStore.id == playlist.currentPlaylistId);
  let favoritePlaylist = state.playlistStore.find(
    playlistStore => playlistStore.id == 'default_' + props.side);
  const queue = playlistStore.tracks;
  return {
    playlist,
    favoritePlaylist,
    playlistStore,
    preview,
    currentPlayingTrack : queue[playlistStore.currentTrackIndex] || {},
    currentPreviewTrack : preview.track
  };
}
const mapDispatchToProps = (dispatch,props) =>({
  pushNotification: (notification) => dispatch(pushNotification(notification)),
  onTrackSelected : (track,trackList) => {
    console.log('tracklist connect onTrackSelected',track,trackList);
    dispatch(setPlaylist(props.side,trackList,'playbackQueue_'+props.side));
    dispatch(changeCurrentPlayIndex(props.side,track,'playbackQueue_'+props.side));
  },
  onTrackPreviewStart: (track) =>{
    dispatch(setPreviewTrack(props.side,track));
  },
  onTrackPreviewEnd: () =>{
    dispatch(setPreviewTrack(props.side,null));
  }
});
const mergeProps = (propsFromState, propsFromDispatch, ownProps) => {
  return {...propsFromDispatch,...ownProps,...propsFromState}
};
const ConnectedTrackListContainer = connect(mapStateToProps,mapDispatchToProps,mergeProps)(TrackListContainer);

AppRegistry.registerComponent('TrackListContainer', () => ConnectedTrackListContainer);

export default ConnectedTrackListContainer;
