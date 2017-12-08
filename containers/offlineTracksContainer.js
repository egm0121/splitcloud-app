/**
 * @flow
 */
import React, { PropTypes, Component } from 'react';
import { AppRegistry, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import TrackListContainer from './trackListContainer';
class OfflineTracksContainer extends Component {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <View style={styles.container}>
        <TrackListContainer {...this.props}
          side={this.props.side}
          trackList={this.props.tracks}
        />
      </View>
    );
  }
}
OfflineTracksContainer.propTypes = {
  side : PropTypes.string.isRequired
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
const mapStateToProps = (state,props) => {
  const byId = (t) => (tt) => t.id == tt.id;
  const notIn = (arr) => (t) => !arr.find(byId(t));
  const allSavedSongs = state.playlistStore
    .filter((playlist) => playlist.id.indexOf('default_') == 0)
    .reduce((allTracks,playlist) => {
      return allTracks.concat(playlist.tracks.filter(notIn(allTracks)));
    },[]);
  return {
    tracks : allSavedSongs
  };
}
const ConnectedOfflineTracksContainer = connect(mapStateToProps)(OfflineTracksContainer);

AppRegistry.registerComponent('OfflineTracksContainer', () => ConnectedOfflineTracksContainer);

export default ConnectedOfflineTracksContainer;
