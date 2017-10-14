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
import UploaderProfile from '../components/uploaderProfile';
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
      this.props.scUploader,
      'side',this.props.side
    );
    this.state = {
      trackList : []
    };
    this.onRequestFail = this.onRequestFail.bind(this);
    this._markAsCurrentTrack = this._markAsCurrentTrack.bind(this);
  }
  generateRequestInvalidationToken(){
    this.prevQueryCancelToken = axios.CancelToken.source();
    return this.prevQueryCancelToken;
  }
  loadTopSoundCloudTracks(){
    this._invalidatePrevRequest();
    this.props.onLoadingStateChange(true);
    let requestPromise = this.scApi.getPopularByGenre(
      this.state.selectedGenre,
      this.state.selectedRegion,
      { cancelToken : this.generateRequestInvalidationToken().token});
    requestPromise.catch((err) => {

      this.props.onRequestFail(err,this.state.selectedGenre);
      return Promise.resolve(err);
    }).then(
      (val) => {
        if(axios.isCancel(val)){
          return false;
        }
        this.props.onLoadingStateChange(false);
      }
    );
    return requestPromise.then((resp) =>
      resp.data.collection.map(
      (item) => {
        let track = item.track;
        track.stream_url = track.uri + '/stream'
        return track;
      }
    ));
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
  _markAsCurrentTrack(item){
    const currTrack = this.props.currentPlayingTrack || {};
    if(item.id == currTrack.id){
      return {
        ...item,
        isCurrentTrack : true
      }
    }
    return item;
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
        <View>
        {/*<Text>Uploader profile for sc username: {this.props.scUploader}</Text>*/}
        <UploaderProfile {...this.props} />
        </View>
      </View>
    );
  }
}
uploaderProfileContainer.propTypes = {
  side : PropTypes.string.isRequired,
  scUploader : PropTypes.string.isRequired,
  onClose : PropTypes.func.isRequired
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:40,
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
  pushNotification: (notification) => dispatch(pushNotification(notification)),
  onTrackSelected : (track) => dispatch(addPlaylistItem(props.side,track))
});
const ConnecteduploaderProfileContainer = connect(mapStateToProps,mapDispatchToProps)(uploaderProfileContainer);

AppRegistry.registerComponent('uploaderProfileContainer', () => ConnecteduploaderProfileContainer);

export default ConnecteduploaderProfileContainer;
