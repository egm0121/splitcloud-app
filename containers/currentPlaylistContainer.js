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
import config from '../helpers/config';
import { connect } from 'react-redux';
import TrackList from '../components/trackList';
import {removeQeueuedTrack} from '../redux/actions/currentPlaylistActions';

class CurrentPlaylistContainer extends Component {
  constructor(props){
    super(props);
  }

  render() {

    return (
      <View style={styles.container}>
        <TrackList
            tracksData={this.props.playlist}
            onTrackAction={this.props.onRemoveTrack}
            onTrackActionRender={'X'}
            {...this.props}
            />
      </View>
    );
  }
}
CurrentPlaylistContainer.propTypes = {
  side : PropTypes.string.isRequired,
  onTrackSelected: PropTypes.func.isRequired,
  onRemoveTrack: PropTypes.func,
  onClose: PropTypes.func
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F50'
  }
});
const mapStateToProps = (state,props) => {
  const pickerState =
    state.songPickers.filter((picker) => picker.side == props.side).pop();
  return pickerState;
}
const mapDispatchToProps = (dispatch) => ({
   onRemoveTrack(track){
     console.log('should dispatch an action to remove the track from the playlist');
     //dispatch(removeQeueuedTrack(track,this.props.side))
   }
});
CurrentPlaylistContainer = connect(mapStateToProps,mapDispatchToProps)(CurrentPlaylistContainer);

AppRegistry.registerComponent('CurrentPlaylistContainer', () => CurrentPlaylistContainer);

export default CurrentPlaylistContainer;
