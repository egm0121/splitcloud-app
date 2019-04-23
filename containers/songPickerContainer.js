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
import {
  updateSearchTerms,
  setLoading
} from '../redux/actions/songPickerActions';
import {
  pushNotification
} from '../redux/actions/notificationActions';
import {
  markFeatureDiscovery
} from  '../redux/actions/featureDiscoveryActions';
import {
  FEATURE_PREVIEW
} from '../helpers/constants';
import FeatureDiscoveryContainer from './featureDiscoveryContainer';
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
          <FeatureDiscoveryContainer featureName={FEATURE_PREVIEW}>
        {() => {
          setTimeout( () => this.props.pushNotification({
            type:'image',
            timeout:4 * 1e3,
            imageSource: require('../assets/long_tap.png'),
            message: `\nTap and hold \nto preview a song`,
            size: 'big'
          }),1e3);
          this.props.markPreviewDiscoveryDone();
          return null;
        }}
        </FeatureDiscoveryContainer>
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
    flex: 1
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
  onSearchTermsChange: (terms) => dispatch(updateSearchTerms(props.side,terms)),
  markPreviewDiscoveryDone: () => dispatch(markFeatureDiscovery(FEATURE_PREVIEW)),
});
const ConnectedSongPickerContainer = connect(mapStateToProps,mapDispatchToProps)(SongPickerContainer);

AppRegistry.registerComponent('SongPickerContainer', () => ConnectedSongPickerContainer);

export default ConnectedSongPickerContainer;
