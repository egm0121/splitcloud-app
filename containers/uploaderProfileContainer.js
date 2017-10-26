/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  ListView,
  View,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import config from '../helpers/config';
import THEME from '../styles/variables'
import { connect } from 'react-redux';
import ArtistProfileHeader from '../components/artistProfileHeader';
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
import {formatSidePlayerLabel,ucFirst} from '../helpers/formatters';
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
      trackList : [],
      profileDetails:false
    };
    this.scApi = new SoundCloudApi({clientId: SC_CLIENT_ID});
    this.onRequestFail = this.onRequestFail.bind(this);
  }
  updateProfileTracks(url){
    this.setState({trackList:[]});
    this.loadUploaderProfileTracks(url).then((tracks) =>{
      this.setState({trackList:tracks});
    });
  }
  updateProfileDetails(url){
    this.setState({profileDetails:false});
    this.scApi.resolveScResource(url).then((resp) => {
      this.setState({profileDetails:this.scApi.transformUserPayload(resp.data)});
    });
  }
  componentWillMount(){
    console.log('uploaderProfileContainer props',this.props.scUploaderLink);
    this.updateProfileTracks(this.props.scUploaderLink);
    this.updateProfileDetails(this.props.scUploaderLink);
  }
  componentWillUnmount(){
    this.prevQueryCancelToken.cancel();
  }
  componentWillReceiveProps(newProps){
    console.log('uploaderProfileContainer newProps',newProps.scUploaderLink);
    if(this.props.scUploaderLink != newProps.scUploaderLink){
      this.updateProfileTracks(newProps.scUploaderLink);
      this.updateProfileDetails(newProps.scUploaderLink);
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
        <HeaderBar title={`${(formatSidePlayerLabel(this.props.side)).toUpperCase()} PLAYER`}>
          <BackButton style={styles.backButton} onPressed={this.props.onClose} />
        </HeaderBar>
        <TrackListContainer {...this.props}
          side={this.props.side}
          trackList={this.state.trackList}
          onHeaderRender={() =>
            <View style={styles.headerContainer}>
              {!this.state.profileDetails ?
                <ActivityIndicator animating={true} style={styles.loadingIndicator} /> :
                <ArtistProfileHeader user={this.state.profileDetails} />
              }
            </View>}
        />
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
  loadingIndicator:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    height:100
  },
  headerContainer:{
    flexDirection:'row'
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
