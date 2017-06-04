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
import SongPicker from '../components/songPicker';
import BackButton from '../components/backButton';
import {updateSearchTerms} from '../redux/actions/songPickerActions';
const {SC_CLIENT_ID} = config;
const DEBOUNCE_MILLISEC = 100;
const SC_RESULT_LIMIT = 100;
class SongPickerContainer extends Component {
  constructor(props){
    super(props);
    this.onSearchTermsChange = this.onSearchTermsChange.bind(this);
  }
  onSearchTermsChange(terms){
    this.props.dispatch(updateSearchTerms(this.props.side,terms));
  }
  render() {

    return (
      <View style={styles.container}>
        <BackButton style={styles.backButton} onPressed={this.props.onClose} />
        <SongPicker
            scClientId={SC_CLIENT_ID}
            scResultLimit={SC_RESULT_LIMIT}
            showStreamableOnly={true}
            debounceWait={DEBOUNCE_MILLISEC}
            onSearchTermsChange={this.onSearchTermsChange}
            currentPlayingTrack={
              this.props.playlist.tracks[this.props.playlist.currentTrackIndex]
            }
            searchTerms = {this.props.picker.searchTerms}
            {...this.props}
            />
      </View>
    );
  }
}
SongPickerContainer.propTypes = {
  side : PropTypes.string.isRequired,
  onSongSelected: PropTypes.func.isRequired,
  onSongQueued: PropTypes.func,
  onClose: PropTypes.func
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F50'
  },
  backButton:{
    zIndex:20
  }
});
const mapStateToProps = (state,props) => {
  const pickerState =
    state.songPickers.filter((picker) => picker.side == props.side).pop();
  const playlistState =
    state.playlist.filter((picker) => picker.side == props.side).pop();
  return {
    picker : pickerState,
    playlist : playlistState
  };
}
const ConnectedSongPickerContainer = connect(mapStateToProps)(SongPickerContainer);

AppRegistry.registerComponent('SongPickerContainer', () => ConnectedSongPickerContainer);

export default ConnectedSongPickerContainer;
