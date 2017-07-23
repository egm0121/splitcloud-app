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
  TouchableOpacity
} from 'react-native';
import throttle from 'lodash.throttle';
import axios from 'axios';
import SoundCloudApi from '../modules/SoundcloudApi';
import THEME from '../styles/variables';
import TrackList from '../components/trackList';
import TopList from '../components/topList';
import {formatDuration} from '../helpers/formatters';
class SongPicker extends Component {
  constructor(props){
    super(props);

    this._onSearchChange = this._onSearchChange.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this._onClearSearch = this._onClearSearch.bind(this);
    this._markAsCurrentTrack = this._markAsCurrentTrack.bind(this);
    this.onTrackDescRender = this.onTrackDescRender.bind(this);
    this.isSearchEmpty = this.isSearchEmpty.bind(this);

    this.state = {
      searchInput: this.props.searchTerms || '',
      pureList : []
    };
  }
  componentWillMount(){
    this.scApi = new SoundCloudApi({clientId :this.props.scClientId});
    this.SC_CLIENT_ID = this.props.scClientId ;
    this.scResultLimit = this.props.scResultLimit;
    this.showStreamableOnly = this.props.showStreamableOnly;
    this._onSearchTermsChange = throttle(
      this._onSearchTermsChange.bind(this),
      this.props.debounceWait
    );
    //start immediately a search for the initial searchInput value.
    this._onSearchChange(this.state.searchInput);
  }

  _onSearchTermsChange(text){
    this.performScPublicSearch(text).then(this.updateResultList,(err) => {
      console.log('ignore as old term request',err)
    });
  }
  _onSearchChange(text){
    this.props.onSearchTermsChange(text);
    if(text){
      this._onSearchTermsChange(text);
    } else {
      this._invalidatePrevRequest();
      this.props.onLoadingStateChange(true);
      this.updateResultList(false);
    }
    this.setState({searchInput:text});
  }
  _invalidatePrevRequest(){
    if(this.prevQueryCancelToken){
      this.prevQueryCancelToken.cancel({aborted:true});
    }
  }
  isSearchEmpty(){
    return this.state.searchInput.length === 0;
  }
  generateRequestInvalidationToken(){
    this.prevQueryCancelToken = axios.CancelToken.source();
    return this.prevQueryCancelToken;
  }
  performScPublicSearch(term){
    this._invalidatePrevRequest();
    this.props.onLoadingStateChange(true);

    let requestPromise = this.scApi.searchPublic(term,{
      cancelToken : this.generateRequestInvalidationToken().token
    });
    requestPromise.catch((err) => Promise.resolve(err)).then(
      (val) => {
        if(axios.isCancel(val)){
          return false;
        }
        this.props.onLoadingStateChange(false);
      }
    );
    return requestPromise.then((resp) => resp.data);
  }
  updateResultList(resp){
    // in case of empty results or no search terms
    if(!resp){
      return this.setState({ pureList : [] });
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
    this.setState({ pureList : tracks });
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
  onTrackDescRender(rowData){
    return rowData.duration ?
      `${formatDuration(rowData.duration,{milli:true})} • ${rowData.username}` :
      rowData.username ;
  }
  _onClearSearch(){
    this._onSearchChange('');
  }
  render() {
    let clearButtonOpacity = this.isSearchEmpty() ? 0 : 1;
    let spinnerPosition = this.isSearchEmpty() ? styles.pushRightSpinner : {};
    return (
      <View style={styles.container}>
        {this.isSearchEmpty() ? null :
        <View style={[styles.clearSearchAction]}>
          <TouchableOpacity onPress={this._onClearSearch} style={styles.clearSearchTouchable}>
            <Text style={styles.clearSearchActionText}>✕</Text>
          </TouchableOpacity>
        </View>}
        <ActivityIndicator animating={this.props.isLoading} style={[styles.loaderStyle,spinnerPosition]} />
        <View style={styles.searchInputView}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search song or artist "
            value={this.state.searchInput}
            placeholderTextColor={THEME.mainColor}
            onChangeText={this._onSearchChange} />
        </View>
        {this.isSearchEmpty() ?
          <TopList
            onTrackAction={this.props.onSongQueued}
            onTrackSelected={this.props.onSongSelected}
            {...this.props}
          /> :
        <TrackList
          tracksData={this.state.pureList.map(this._markAsCurrentTrack)}
          onTrackDescRender={this.onTrackDescRender}
          onTrackActionRender={(rowData) => rowData.isCurrentTrack ? null : '+'}
          highlightProp={'isCurrentTrack'}
          onTrackAction={this.props.onSongQueued}
          onTrackSelected={this.props.onSongSelected}
          {...this.props}
          />
        }
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchInput : {
    paddingTop: 12,
    height: 40,
    color: THEME.mainHighlightColor,
    paddingLeft: 40,
    paddingRight: 70,
    lineHeight:20
  },
  searchInputView :{
    borderColor : THEME.contentBorderColor,
    borderBottomWidth :2,
    paddingTop: 10,
    backgroundColor: THEME.mainBgColor,
    height: 60
  },
  clearSearchAction:{
    position:'absolute',
    borderRadius:15,
    right:15,
    top:22,
    zIndex:10,
    height:30,
    width:30,
    backgroundColor:THEME.contentBorderColor
  },
  pushRightSpinner:{
    right:20,
  },
  loaderStyle:{
    position:'absolute',
    right:55,
    top:27,
    zIndex:10
  },
  clearSearchActionText:{
    color: THEME.mainHighlightColor,
    fontSize:20,
    lineHeight:28,
    textAlign:'center'
  },
  listDescription : {
    backgroundColor: THEME.contentBgColor,
    paddingVertical:15,
    paddingHorizontal:10,
    borderBottomWidth:1,
    borderColor: THEME.contentBorderColor
  },
  listDescriptionText :{
    fontSize : 18,
    fontWeight:'600',
    color: THEME.mainHighlightColor
  }
});

SongPicker.propTypes = {
  onSongSelected: PropTypes.func.isRequired,
  onSongQueued: PropTypes.func,
  onClose: PropTypes.func,
  onSearchTermsChange: PropTypes.func
};

export default SongPicker;
