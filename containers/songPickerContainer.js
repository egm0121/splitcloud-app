/**
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  ListView,
  View,
  TouchableOpacity,
} from 'react-native';

import SongPicker from '../components/songPicker';
const DEBOUNCE_MILLISEC = 100;
const SC_CLIENT_ID = "54921f38ed5d570772c094534b9f50b5";
const SC_RESULT_LIMIT = 100;
class SongPickerContainer extends Component {
  constructor(){
    super();
  }
  render() {

    return (
      <View style={styles.container}>
        <SongPicker
            scClientId={SC_CLIENT_ID}
            scResultLimit={SC_RESULT_LIMIT}
            showStreamableOnly={true}
            debounceWait={DEBOUNCE_MILLISEC}
            onSongSelected={this.props.onSongSelected}
            onSongQueued={this.props.onSongQueued}
            onClose={this.props.onClose}
            />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F50'
  }
});

AppRegistry.registerComponent('SongPickerContainer', () => SongPickerContainer);

export default SongPickerContainer;
