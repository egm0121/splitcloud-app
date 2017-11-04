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
    this.scApi = new SoundCloudApi({clientId: SC_CLIENT_ID});
  }
  componentWillMount(){
    this.loadTracks().then(this.updateResultList).catch(() =>{});
  }
  componentWillUnmount(){
    this.prevQueryCancelToken.cancel('aborted');
  }
  loadTracks(){
    this.props.onLoadingStateChange(true);
    let requestPromise = axios({
      url : 'http://pointlineshape.com/api/music/splitcloud',
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
      let payload = resp.data
      .map((e) => e.attachments.attachments.extra)
      .filter((e) => e);
      return payload;
    });
  }
  updateResultList(resp){
    // in case of empty results or no search terms
    if(!resp){
      return this.setState({ trackList : [] });
    }
    let tracks = resp.map((t) => this.scApi.resolvePlayableTrackItem(
      {
        id: t.id,
        label : t.title,
        username: t.user.username,
        streamUrl : t.stream_url,
        artwork : t.artwork_url,
        scUploaderLink : t.user.permalink_url,
        duration: t.duration
      })
    );
    this.setState({ trackList : tracks });
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
