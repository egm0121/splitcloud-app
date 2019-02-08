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
import TrackListContainer from '../containers/trackListContainer';
import {
  pushNotification
} from '../redux/actions/notificationActions';
import {
  addPlaylistItem
} from '../redux/actions/currentPlaylistActions';
import {formatDuration, formatGenreLabel} from '../helpers/formatters';
const {SC_CLIENT_ID} = config;

class DiscoverProviderContainer extends Component {
  constructor(props){
    super(props);
    console.log(
      'DiscoverProviderContainer mounted with props',this.props.side
    );
    console.log(this.props.onTrackAction)
    this.state = {
      trackList : []
    };
    this.onRequestFail = this.onRequestFail.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this.transformApiPayload = this.transformApiPayload.bind(this);
    this.scApi = new SoundCloudApi({clientId: SC_CLIENT_ID});
  }
  componentWillMount(){
    this.loadTracks().then(this.updateResultList).catch((err) =>{
      console.error(err)
    });
  }
  componentWillUnmount(){
    this.prevQueryCancelToken.cancel('aborted');
  }
  loadTracks(){
    this.props.onLoadingStateChange(true);
    let requestPromise = axios({
      url : 'http://pointlineshape.com/api/music/splitcloud/group',
      timeout : 5000,
      cancelToken : this.generateRequestInvalidationToken().token
    });
    requestPromise.catch((err) => {
      console.log(err);
      if(!axios.isCancel(err)){
        this.props.onRequestFail(err);
      }
      return Promise.resolve(err);
    }).then(() => {
      this.props.onLoadingStateChange(false);
    })
    return requestPromise.then((resp) => {
      console.log('pls api resp',resp)
      let payload = resp.data
      .map(this.transformApiPayload);
      return payload;
    });
  }
  updateResultList(resp){
    console.log('update results',resp)
    // in case of empty results or no search terms
    if(!resp){
      return this.setState({ trackList : [] });
    }
    let tracks = resp;
    console.log('update results with tracks',tracks);
    this.setState({ trackList : tracks });
  }
  transformApiPayload(t){
    return {
      id: t.id,
      label : t.displayName,
      username: t.user.title,
      streamUrl : this.scApi.resolveStreamUrlFromTrackId(t.id),
      artwork : t.image.url,
      scUploaderLink : t.user.url,
      duration: t.duration
    };
  }
  generateRequestInvalidationToken(){
    this.prevQueryCancelToken = axios.CancelToken.source();
    return this.prevQueryCancelToken;
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
        <TrackListContainer
          side={this.props.side}
          trackList={this.state.trackList}
        />
      </View>
    );
  }
}
DiscoverProviderContainer.propTypes = {
  side : PropTypes.string.isRequired,
  onClose : PropTypes.func.isRequired
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:THEME.mainBgColor
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
  const queue = playlistState.playbackQueue;
  return {
    playlist : playlistState,
    currentTrack : queue[playlistState.currentTrackIndex]
  };
}
const mapDispatchToProps = (dispatch,props) =>({
  pushNotification: (notification) => dispatch(pushNotification(notification))
});
const ConnectedDiscoverProviderContainer = connect(mapStateToProps,mapDispatchToProps)(DiscoverProviderContainer);

AppRegistry.registerComponent('DiscoverProviderContainer', () => ConnectedDiscoverProviderContainer);

export default ConnectedDiscoverProviderContainer;
