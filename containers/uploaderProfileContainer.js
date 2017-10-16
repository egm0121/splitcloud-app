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
import axios from 'axios';
import config from '../helpers/config';
import THEME from '../styles/variables'
import { connect } from 'react-redux';
import BackButton from '../components/backButton';
import SoundCloudApi from '../modules/SoundcloudApi';
import HeaderBar from '../components/headerBar';
import TrackListContainer from './trackListContainer';
import {
  pushNotification
} from '../redux/actions/notificationActions';
import {
  addPlaylistItem
} from '../redux/actions/currentPlaylistActions';
const {SC_CLIENT_ID} = config;
class uploaderProfileContainer extends Component {
  constructor(props){
    super(props);
    console.log(
      'uploaderProfileContainer mounted with props',
      this.props.scUploaderLink,
      'side',this.props.side
    );
    this.state = {
      trackList : []
    };
    this.scApi = new SoundCloudApi({clientId: SC_CLIENT_ID});
    this.onRequestFail = this.onRequestFail.bind(this);
  }
  updateProfileTracks(url){
    this.loadUploaderProfileTracks(url).then((tracks) =>{
      this.setState({trackList:tracks});
    });
  }
  componentWillMount(){
    console.log('uploaderProfileContainer props',this.props.scUploaderLink);
    this.updateProfileTracks(this.props.scUploaderLink);
  }
  componentWillUnmount(){
    this.prevQueryCancelToken.cancel();
  }
  componentWillReceiveProps(newProps){
    console.log('uploaderProfileContainer newProps',newProps.scUploaderLink);
    if(this.props.scUploaderLink != newProps.scUploaderLink){
      this.updateProfileTracks(newProps.scUploaderLink);
    }
  }
  generateRequestInvalidationToken(){
    this.prevQueryCancelToken = axios.CancelToken.source();
    return this.prevQueryCancelToken;
  }
  loadUploaderProfileTracks(url){
    let requestPromise = this.scApi.getTracksByUploaderLink(
      url,
      { cancelToken : this.generateRequestInvalidationToken().token}
    );
    requestPromise
    .catch((err) => {
      this.props.onRequestFail(err);
      return Promise.resolve(err);
    });
    return requestPromise;
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
        <HeaderBar title={`Music by ${this.props.currentTrack.username}`}>
          <BackButton style={styles.backButton} onPressed={this.props.onClose} />
        </HeaderBar>
        <TrackListContainer {...this.props}
          side={this.props.side}
          trackList={this.state.trackList} />
      </View>
    );
  }
}
uploaderProfileContainer.propTypes = {
  side : PropTypes.string.isRequired,
  scUploaderLink : PropTypes.string.isRequired,
  onClose : PropTypes.func.isRequired
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  const playlistState =
    state.playlist.filter((picker) => picker.side == props.side).pop();
  const uploaderProfile =
    state.uploaderProfile.filter((profile) => profile.side == props.side).pop();
  const queue = playlistState.playbackQueue;
  const currentTrack =  queue[playlistState.currentTrackIndex]
  return {
    playlist : playlistState,
    currentTrack,
    scUploaderLink : uploaderProfile ? uploaderProfile.lastUploaderUrl :null
  };
}
const mapDispatchToProps = (dispatch,props) =>({
  pushNotification: (notification) => dispatch(pushNotification(notification))
});
const ConnecteduploaderProfileContainer = connect(mapStateToProps,mapDispatchToProps)(uploaderProfileContainer);

AppRegistry.registerComponent('uploaderProfileContainer', () => ConnecteduploaderProfileContainer);

export default ConnecteduploaderProfileContainer;
