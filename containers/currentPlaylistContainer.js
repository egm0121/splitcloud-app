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
  Alert
} from 'react-native';
import config from '../helpers/config';
import { connect } from 'react-redux';
import TrackList from '../components/trackList';
import BackButton from  '../components/backButton';
import ClearPlaylistButton from '../components/clearPlaylistButton';
import Button from '../components/button'
import {removeQueuedTrack, setPlaylist} from '../redux/actions/currentPlaylistActions';
import {pushNotification} from  '../redux/actions/notificationActions';
import {formatDuration,formatSidePlayerLabel,ucFirst} from '../helpers/formatters';
import THEME from '../styles/variables';

class CurrentPlaylistContainer extends Component {
  constructor(props){
    super(props);
    this._markAsCurrentTrack = this._markAsCurrentTrack.bind(this);
    this.onTrackDescRender = this.onTrackDescRender.bind(this);
    this.onClearPlaylist = this.onClearPlaylist.bind(this);
  }
  componentWillReceiveProps(newProps){}
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
        {text: 'Clear All', onPress: () => this.props.onClearPlaylist(), style:'destructive'},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      ]
    )
  }
  render() {
    const playlistTracksData =
      this.props.playlist.tracks.map(this._markAsCurrentTrack);
    return (
      <View style={styles.container}>
        <View style={styles.sectionTitleView}>
          <BackButton onPressed={this.props.onClose} style={styles.closeButton}/>
          <Text style={styles.sectionTitle}>{this.props.playlistTitle}</Text>
          <ClearPlaylistButton onPressed={this.onClearPlaylist} style={styles.clearButton}/>
        </View>
        <TrackList
            tracksData={playlistTracksData}
            onTrackAction={this.props.onRemoveTrack}
            onTrackDescRender={this.onTrackDescRender}
            onTrackActionRender={(rowData) => rowData.isCurrentTrack ? null : '×'}
            trackActionStyles={[{fontSize:45}]}
            highlightProp={'isCurrentTrack'}
            {...this.props}
            />
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
  clearButton: {
    position:'absolute',
    right:20,
    top:20,
    zIndex:10,
    height:30
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
  }
});
const mapStateToProps = (state,props) => {
  const pickerState =
    state.songPickers.filter((playlist) => playlist.side == props.side).pop();
  const playlistState = state.playlist.filter((playlist) => playlist.side === props.side).pop();
  return {
    picker : pickerState,
    playlist : playlistState
  };
}
const mapDispatchToProps = (dispatch,props) => ({
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
