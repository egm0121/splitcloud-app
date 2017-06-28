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
} from 'react-native';
import config from '../helpers/config';
import { connect } from 'react-redux';
import TrackList from '../components/trackList';
import BackButton from  '../components/backButton';
import {removeQueuedTrack, setPlaylist} from '../redux/actions/currentPlaylistActions';
import {pushNotification} from  '../redux/actions/notificationActions';
import THEME from '../styles/variables';

class CurrentPlaylistContainer extends Component {
  constructor(props){
    super(props);
    this._markAsCurrentTrack = this._markAsCurrentTrack.bind(this);
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
  render() {
    const playlistTracksData =
      this.props.playlist.tracks.map(this._markAsCurrentTrack);
    return (
      <View style={styles.container}>
        <View style={styles.sectionTitleView}>
          <BackButton onPressed={this.props.onClose} />
          <Text style={styles.sectionTitle}>{this.props.playlistTitle}</Text>
          <TouchableOpacity style={styles.clearButton} onPress={this.props.onClearPlaylist}>
              <Image style={[styles.clearListIcon]} source={require('../assets/flat_clear_list.png')} resizeMode={'cover'}/>
          </TouchableOpacity>
        </View>
        <TrackList
            tracksData={playlistTracksData}
            onTrackAction={this.props.onRemoveTrack}
            onTrackActionRender={(rowData) => rowData.isCurrentTrack ? null : '✕'}
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
    fontSize: 17
  },
  clearButton: {
    position:'absolute',
    right:20,
    top:20,
    zIndex:10,
    height:30
  },
  clearListIcon: {
    width:30,
    height:30
  },
  sectionTitleView :{
    alignItems: 'center',
    height: 60,
    paddingTop: 25,
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
    console.log('should dispatch an action to remove the track from the playlist');
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
