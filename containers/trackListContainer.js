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
  View,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import config from '../helpers/config';
import THEME from '../styles/variables'
import { connect } from 'react-redux';
import { compose } from 'redux';
import SoundCloudApi from '../modules/SoundcloudApi';
import TrackList from '../components/trackList';
import {
  pushNotification
} from '../redux/actions/notificationActions';
import {
  setPlaylist,
  addPlaylistItem,
  changeCurrentPlayIndex
} from '../redux/actions/currentPlaylistActions';
import {
  formatDurationExtended,
  formatNumberPrefix
} from '../helpers/formatters';
const {SC_CLIENT_ID} = config;

class TrackListContainer extends Component {
  constructor(props){
    super(props);
    console.log(
      'TrackListContainer mounted with props',this.props.side
    );
    this._markAsCurrentTrack = this._markAsCurrentTrack.bind(this);
    this.scApi = new SoundCloudApi({clientId: SC_CLIENT_ID});
    this.trackListRef = null;
    console.log('TrackListContainer onEndThreshold',props.onEndThreshold)
  }
  componentWillReceiveProps(newProps){
    if(this.props.resetToTop && (this.props.trackList !== newProps.trackList)){
      console.log('scroll to top');
      this.trackListRef.scrollTo({x:0, y:0, animated:true});
    }
  }
  _markAsCurrentTrack(item){
    const currTrack = this.props.currentPlayingTrack || {};
    if(item.id == currTrack.id){
      return {
        ...item,
        isCurrentTrack : true
      }
    }
    return item;
  }
  onTrackDescRender(rowData){
    let
      duration = rowData.duration ?
        formatDurationExtended(rowData.duration,{milli:true}) : '',
      playCount = rowData.playbackCount ?
        '▶ '+formatNumberPrefix(rowData.playbackCount) : '',
      username = 'by '+rowData.username;
    return [duration,playCount,username].filter(e =>e.length).join(' • ') ;
  }
  render() {
    let trackData = this.props.trackList.map(this._markAsCurrentTrack);
    return (
      <View style={styles.container}>
        <TrackList
          onHeaderRender={this.props.onHeaderRender}
          listRef={(ref) => this.trackListRef = ref}
          tracksData={trackData}
          onTrackDescRender={this.onTrackDescRender}
          onTrackActionRender={this.props.onTrackActionRender}
          highlightProp={this.props.highlightProp}
          onTrackAction={this.props.onTrackAction}
          onTrackSelected={this.props.onTrackSelected}
          isLoading={this.props.isLoading}
          onEndReached={this.props.onEndReached}
          onEndThreshold={this.props.onEndThreshold}
        ></TrackList>
      </View>
    );
  }
}
TrackListContainer.defaultProps ={
  resetToTop:false,
  onTrackActionRender(rowData){return rowData.isCurrentTrack ? null : '+'},
  highlightProp: 'isCurrentTrack'
}
TrackListContainer.propTypes = {
  side : PropTypes.string.isRequired,
  trackList : PropTypes.array.isRequired,
  currentPlayingTrack : PropTypes.object.isRequired,
  resetToTop: PropTypes.bool,
  onTrackActionRender: PropTypes.func,
  onTrackAction: PropTypes.func.isRequired,
  onTrackSelected: PropTypes.func.isRequired,
  onHeaderRender: PropTypes.func,
  isLoading: PropTypes.bool
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:THEME.mainBgColor
  }
});
const mapStateToProps = (state,props) => {
  let playlist = state.playlist.find((playlist) => playlist.side === props.side);
  let playlistStore = state.playlistStore.find(playlistStore => playlistStore.id == playlist.currentPlaylistId);
  const queue = playlistStore.tracks;
  return {
    playlist,
    playlistStore,
    currentPlayingTrack : queue[playlistStore.currentTrackIndex] || {}
  };
}
const mapDispatchToProps = (dispatch,props) =>({
  pushNotification: (notification) => dispatch(pushNotification(notification)),
  onTrackAction : (track) => {
    dispatch(pushNotification({
      type : 'success',
      message : 'Added Track!'
    }));
    dispatch(addPlaylistItem(props.side,track,'default_'+props.side))
  },
  onTrackSelected : (track,trackList) => {
    console.log('tracklist connect onTrackSelected');
    dispatch(setPlaylist(props.side,trackList,'playbackQueue_'+props.side));
    dispatch(changeCurrentPlayIndex(props.side,track,'playbackQueue_'+props.side));
  }
});
const mergeProps = (propsFromState, propsFromDispatch, ownProps) => {
  return {...propsFromDispatch,...ownProps,...propsFromState}
};
const ConnectedTrackListContainer = connect(mapStateToProps,mapDispatchToProps,mergeProps)(TrackListContainer);

AppRegistry.registerComponent('TrackListContainer', () => ConnectedTrackListContainer);

export default ConnectedTrackListContainer;
