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
    this.onClosePicker = this.onClosePicker.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this._markAsCurrentTrack = this._markAsCurrentTrack.bind(this);
    this.openGenrePicker = this.openGenrePicker.bind(this);
    this._onRegionChange = this._onRegionChange.bind(this);
    this.openRegionPicker = this.openRegionPicker.bind(this);
    this.getLabelForRegion = this.getLabelForRegion.bind(this);
    this.getLabelForGenre = this.getLabelForGenre.bind(this);

    this.state = {
      selectedGenre : this.props.selectedGenre || SoundCloudApi.genre.ALL,
      selectedRegion : this.props.selectedRegion || SoundCloudApi.region.WORLDWIDE,
      genreOptions : this.getOptionsListByType('genre'),
      regionOptions: this.getOptionsListByType('region'),
      pickerModalType: 'genre',
      trackList : []
    };
    console.log('genreOptions',this.getOptionsListByType('genre'))
  }
  componentWillMount(){
    this.scApi = new SoundCloudApi({clientId: this.props.scClientId});
    this.showStreamableOnly = this.props.showStreamableOnly;
    //fetch inial genre list
    this.loadTopSoundCloudTracks().then(this.updateResultList);
  }
  componentDidUpdate(prevProps,prevState){
    if(
      this.state.selectedGenre !== prevState.selectedGenre ||
      this.state.selectedRegion !== prevState.selectedRegion
    ){
      this.loadTopSoundCloudTracks().then(this.updateResultList,(err) => {
        console.log('ignore as old genre request',err)
      });
    }
  }

  getOptionsListByType(type){
    if(!['genre','region'].includes(type)) return [];
    return Object.keys(SoundCloudApi[type]).map((key,i) => {
      return {
        label : formatGenreLabel(key),
        value : SoundCloudApi[type][key],
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
  getLabelForRegion(regionValue){
    return formatGenreLabel(this.getKeyByValue(SoundCloudApi.region,regionValue));
  }
  _onGenreChange(genre){
    this.setState({selectedGenre:genre});
  }
  _onRegionChange(region){
    this.setState({selectedRegion:region});
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
  onClosePicker(){
    this.setState({pickerModalOpen:false});
  }
  openGenrePicker(){
    this.setState({pickerModalOpen:true,pickerModalType:'genre'});
  }
  openRegionPicker(){
    this.setState({pickerModalOpen:true,pickerModalType:'region'});
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
        </View>
        <View style={styles.listDescription}>
          <View style={styles.genreSelectionBtn}>
              <Text style={styles.listDetailText} >Region</Text>
            <TouchableHighlight onPress={this.openRegionPicker}>
                <Text style={styles.genreSelectionText}>{this.getLabelForRegion(this.state.selectedRegion)}</Text>
            </TouchableHighlight>
          </View>
          <View style={styles.genreSelectionBtn}>
            <Text style={styles.listDetailText}>Genre</Text>
            <TouchableHighlight onPress={this.openGenrePicker}>
                <Text style={styles.genreSelectionText}>{this.getLabelForGenre(this.state.selectedGenre)}</Text>
              </TouchableHighlight>
          </View>
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
          {this.state.pickerModalOpen ? this.renderActivePicker(): null }
      </View>
    );
  }
  renderActivePicker(){
    if(this.state.pickerModalType == 'genre'){
      return <ModalPicker
        options={this.state.genreOptions}
        selected={this.state.selectedGenre}
        onClose={this.onClosePicker}
        onValueChange={this._onGenreChange}/>;
    }
    if(this.state.pickerModalType == 'region'){
      return <ModalPicker
        options={this.state.regionOptions}
        selected={this.state.selectedRegion}
        onClose={this.onClosePicker}
        onValueChange={this._onRegionChange}/>;
    }
  }
}
TopList.defaultProps = {
  onRequestFail(){}
};
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  descContainer :{
    flex: 1
  },
  genreSelectionBtn :{
    flex:1,
    paddingRight: 10,
    paddingVertical:10,
    alignItems:'center'
  },
  genreSelectionText : {
    color : THEME.mainActiveColor,
    fontSize : 16,
    fontWeight:'600'
  },
  listDescription : {
    backgroundColor: THEME.contentBgColor,
    paddingLeft:10,
    borderBottomWidth:1,
    borderColor: THEME.contentBorderColor,
    justifyContent:'space-between',
    flexDirection:'row'
  },
  listDescriptionText :{
    fontSize : 18,
    paddingVertical:10,
    fontWeight:'600',
    color: THEME.mainHighlightColor
  },
  listDetailText :{
    fontSize : 16,
    color: THEME.mainColor
  }
});

TopList.propTypes = {
  onSongSelected: PropTypes.func.isRequired,
  onSongQueued: PropTypes.func,
  onChartLoadingError :PropTypes.func,
  onClose: PropTypes.func
};

export default TopList;
