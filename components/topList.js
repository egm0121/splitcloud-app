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
  ActivityIndicator,
  View,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native';
import axios from 'axios';
import SoundCloudApi from '../modules/SoundcloudApi';
import THEME from '../styles/variables';
import { ucFirst } from '../helpers/formatters';
import TrackList from '../components/trackList';
import ModalPicker from '../components/modalPicker';
import {formatDuration, formatGenreLabel} from '../helpers/formatters';
class TopList extends Component {
  constructor(props){
    super(props);
    this._onGenreChange = this._onGenreChange.bind(this);
    this.onCloseGenrePicker = this.onCloseGenrePicker.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this._markAsCurrentTrack = this._markAsCurrentTrack.bind(this);
    this.openGenrePicker = this.openGenrePicker.bind(this);
    this.getLabelForGenre = this.getLabelForGenre.bind(this);
    this.getGenreOptionsList = this.getGenreOptionsList.bind(this);
    this.state = {
      selectedGenre : this.props.selectedGenre || SoundCloudApi.genre.ALL,
      genreOptions : this.getGenreOptionsList(),
      trackList : []
    };

  }
  componentWillMount(){
    this.scApi = new SoundCloudApi({clientId: this.props.scClientId});
    this.showStreamableOnly = this.props.showStreamableOnly;
    //fetch inial genre list
    this.loadTopSoundCloudTracks().then(this.updateResultList);
  }
  componentDidUpdate(prevProps,prevState){
    if(this.state.selectedGenre !== prevState.selectedGenre){
      this.loadTopSoundCloudTracks().then(this.updateResultList,(err) => {
        console.log('ignore as old genre request',err)
      });
    }
  }

  getGenreOptionsList(){
    return Object.keys(SoundCloudApi.genre).map((key,i) => {
      return {
        label : formatGenreLabel(key),
        value : SoundCloudApi.genre[key],
        key : i
      }
    });
  }
  getKeyByValue(obj,value){
    return Object.keys(obj).find((key) => obj[key] == value);
  }
  getLabelForGenre(genreValue){
    return formatGenreLabel(this.getKeyByValue(SoundCloudApi.genre,genreValue));
  }
  _onGenreChange(genre){
    this.setState({selectedGenre:genre});
  }
  _invalidatePrevRequest(){
    if(this.prevQueryCancelToken){
      this.prevQueryCancelToken.cancel({aborted:true});
    }
  }
  generateRequestInvalidationToken(){
    this.prevQueryCancelToken = axios.CancelToken.source();
    return this.prevQueryCancelToken;
  }

  loadTopSoundCloudTracks(){
    this._invalidatePrevRequest();
    this.props.onLoadingStateChange(true);
    let requestPromise = this.scApi.getPopularByGenre(this.state.selectedGenre,{
      cancelToken : this.generateRequestInvalidationToken().token
    });
    requestPromise.catch((err) => Promise.resolve(err)).then(
      (val) => {
        console.log('top tracks',val)
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
    let tracks = resp.map((t) => (
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
  onCloseGenrePicker(){
    this.setState({pickerModalOpen:false});
  }
  openGenrePicker(){
    this.setState({pickerModalOpen:true});
  }
  onTrackDescRender(rowData){
    return rowData.duration ?
      `${formatDuration(rowData.duration,{milli:true})} • ${rowData.username}` :
      rowData.username ;
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.listDescription} >
          <View style={styles.descContainer}>
            <Text style={styles.listDescriptionText}>Top Tracks</Text>
          </View>
          <TouchableHighlight style={styles.genreSelectionBtn} onPress={this.openGenrePicker}>
            <Text style={styles.genreSelectionText}>{this.getLabelForGenre(this.state.selectedGenre)}</Text>
          </TouchableHighlight>
        </View>
        <TrackList
          tracksData={this.state.trackList.map(this._markAsCurrentTrack)}
          onTrackDescRender={this.onTrackDescRender}
          onTrackActionRender={(rowData) => rowData.isCurrentTrack ? null : '+'}
          highlightProp={'isCurrentTrack'}
          onTrackAction={this.props.onSongQueued}
          onTrackSelected={this.props.onSongSelected}
          {...this.props}
          />
          {this.state.pickerModalOpen ?
            <ModalPicker
              options={this.state.genreOptions}
              selected={this.state.selectedGenre}
              onClose={this.onCloseGenrePicker}
              onValueChange={this._onGenreChange}/>
            : null }
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  descContainer :{
    flex: 1
  },
  genreSelectionBtn :{
    flex:2,
    alignItems:'flex-end',
    paddingVertical:10
  },
  genreSelectionText : {
    color : THEME.mainActiveColor,
    fontSize : 18,
    fontWeight:'600'
  },
  listDescription : {
    backgroundColor: THEME.contentBgColor,
    paddingHorizontal:10,
    borderBottomWidth:1,
    borderColor: THEME.contentBorderColor,
    justifyContent:'space-between',
    flexDirection:'row'
  },
  listDescriptionText :{
    fontSize : 18,
    lineHeight: 30,
    fontWeight:'600',
    color: THEME.mainHighlightColor
  }
});

TopList.propTypes = {
  onSongSelected: PropTypes.func.isRequired,
  onSongQueued: PropTypes.func,
  onClose: PropTypes.func,
  onSearchTermsChange: PropTypes.func
};

export default TopList;
