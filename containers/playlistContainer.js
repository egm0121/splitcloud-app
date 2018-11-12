/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View
} from 'react-native';
import TrackListContainer from '../containers/trackListContainer';
import BackButton from  '../components/backButton';
import HeaderBar from '../components/headerBar';

class PlaylistContainer extends Component {
  constructor(props){
    super(props);
    console.log('PlaylistContainer props.playlist',this.props.playlist)
  }

  render() {
    const tracks = this.props.playlist.tracks || [];
    const playlistFilteredList = tracks.filter(
      (track) => 'isVisible' in track ? track.isVisible : true
    );
    if(this.props.layout == 'horizontal'){
      return (
        <TrackListContainer
          {...this.props}
          trackList={playlistFilteredList}
          side={this.props.side}
          trackActionStyles={[{fontSize:45}]}
        />
      );
    }
    return (
      <View style={styles.container}>
        <HeaderBar title={this.props.playlist.label}>
          <BackButton onPressed={this.props.onClose} style={styles.closeButton}/>
        </HeaderBar>
        {/*<View style={styles.filterContainerView}>
          <FilterInput
            placeholder={'Filter songs...'}
            value={this.props.playlist.filterTracks}
            onChangeText={this.onFilterTextChange}
            onClearFilter={this.onClearFilter}
            />
        </View>*/}
        <TrackListContainer
            {...this.props}
            trackList={playlistFilteredList}
            side={this.props.side}
            trackActionStyles={[{fontSize:45}]}
            />
      </View>
    );
  }
}
PlaylistContainer.propTypes = {
  side : PropTypes.string.isRequired,
  playlist : PropTypes.object.isRequired
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  closeButton :{
    position:'absolute',
    left:0,
    paddingLeft:10,
    top:10
  }
});

AppRegistry.registerComponent('PlaylistContainer', () => PlaylistContainer);

export default PlaylistContainer;
