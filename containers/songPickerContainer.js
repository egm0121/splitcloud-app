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
import { connect } from 'react-redux';
import SongPicker from '../components/songPicker';
import {updateSearchTerms} from '../redux/actions/songPickerActions';
const DEBOUNCE_MILLISEC = 100;
const SC_CLIENT_ID = "54921f38ed5d570772c094534b9f50b5";
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
        <SongPicker
            scClientId={SC_CLIENT_ID}
            scResultLimit={SC_RESULT_LIMIT}
            showStreamableOnly={true}
            debounceWait={DEBOUNCE_MILLISEC}
            onSearchTermsChange={this.onSearchTermsChange}
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
  }
});
const mapStateToProps = (state,props) => {
  const pickerState =
    state.songPickers.filter((picker) => picker.side == props.side).pop();
  return pickerState;
}
SongPickerContainer = connect(mapStateToProps)(SongPickerContainer);

AppRegistry.registerComponent('SongPickerContainer', () => SongPickerContainer);

export default SongPickerContainer;
