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
import {
  updateSearchTerms,
  setLoading
} from '../redux/actions/songPickerActions';
import {
  pushNotification
} from '../redux/actions/notificationActions';
const {SC_CLIENT_ID} = config;
const DEBOUNCE_MILLISEC = 100;
const SC_RESULT_LIMIT = 100;
class SongPickerContainer extends Component {
  constructor(props){
    super(props);
    console.log('SongPickerContainer mounted with picker props',this.props.picker);
    this.onRequestFail = this.onRequestFail.bind(this);
  }
  onRequestFail(err,type){
    this.props.pushNotification({
      type : 'error',
      message : 'Data Request Failed'
    });
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
            onSearchTermsChange={this.props.onSearchTermsChange}
            onLoadingStateChange={this.props.onLoadingStateChange}
            onRequestFail={this.onRequestFail}
            searchTerms={this.props.picker.searchTerms}
            isLoading={this.props.picker.isLoading}
            {...this.props}
            />
      </View>
    );
  }
}
SongPickerContainer.propTypes = {
  side : PropTypes.string.isRequired,
  onClose: PropTypes.func
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F50'
  },
  backButton:{
    position:'absolute',
    left:0,
    paddingLeft:10,
    top:20,
    zIndex:20
  }
});
const mapStateToProps = (state,props) => {
  const pickerState =
    state.songPickers.filter((picker) => picker.side == props.side).pop();
  return {
    picker : pickerState
  };
}
const mapDispatchToProps = (dispatch,props) =>({
  pushNotification: (notification) => dispatch(pushNotification(notification)),
  onLoadingStateChange : (isLoading) => dispatch(setLoading(props.side,isLoading)),
  onSearchTermsChange: (terms) => dispatch(updateSearchTerms(props.side,terms))
});
const ConnectedSongPickerContainer = connect(mapStateToProps,mapDispatchToProps)(SongPickerContainer);

AppRegistry.registerComponent('SongPickerContainer', () => ConnectedSongPickerContainer);

export default ConnectedSongPickerContainer;
