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
  addPlaylistItem,
  changeCurrentPlayIndex
} from '../redux/actions/currentPlaylistActions';
import {formatDuration} from '../helpers/formatters';
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
    return rowData.duration ?
      `${formatDuration(rowData.duration,{milli:true})} • ${rowData.username}` :
      rowData.username ;
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
  onHeaderRender: PropTypes.func
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:THEME.mainBgColor
  }
});
const mapStateToProps = (state,props) => {
  const playlistState =
    state.playlist.filter((playlist) => playlist.side == props.side).pop();
  const queue = playlistState.playbackQueue;
  return {
    playlist : playlistState,
    currentPlayingTrack : queue[playlistState.currentTrackIndex] || {}
  };
}
const mapDispatchToProps = (dispatch,props) =>({
  pushNotification: (notification) => dispatch(pushNotification(notification)),
  onTrackAction : (track) => {
    dispatch(pushNotification({
      type : 'success',
      message : 'Added Track!'
    }));
    dispatch(addPlaylistItem(props.side,track))
  },
  onTrackSelected : (track) => {
    console.log('tracklist connect onTrackSelected');
    dispatch(addPlaylistItem(props.side,track));
    dispatch(changeCurrentPlayIndex(props.side,track));
  }
});
const mergeProps = (propsFromState, propsFromDispatch, ownProps) => {
  return {...propsFromDispatch,...ownProps,...propsFromState}
};
const ConnectedTrackListContainer = connect(mapStateToProps,mapDispatchToProps,mergeProps)(TrackListContainer);

AppRegistry.registerComponent('TrackListContainer', () => ConnectedTrackListContainer);

export default ConnectedTrackListContainer;
