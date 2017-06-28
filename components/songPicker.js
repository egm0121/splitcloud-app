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
import THEME from '../styles/variables';
import TrackList from '../components/trackList';
class SongPicker extends Component {
  constructor(props){
    super(props);

    this._onSearchChange = this._onSearchChange.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this._onClearSearch = this._onClearSearch.bind(this);
    this._markAsCurrentTrack = this._markAsCurrentTrack.bind(this);

    this.SC_CLIENT_ID = null;
    this.state = {
      searchInput: this.props.searchTerms || '',
      pureList : []
    };
  }
  componentWillMount(){
    this.SC_CLIENT_ID = this.props.scClientId;
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
    this.props.onSearchTermsChange(text);
    this.performSoundcloudApiSearch(text).then(this.updateResultList,(err) => {
      console.log('ignore as old term request',err)
    });
  }
  _onSearchChange(text){
    if(text){
      this._onSearchTermsChange(text);
    } else {
      this._invalidatePrevRequest();
      this.updateResultList(false);
    }
    this.setState({searchInput:text});
  }
  _invalidatePrevRequest(){
    if(this.prevQueryCancelToken){
      this.prevQueryCancelToken.cancel({aborted:true});
    }
  }
  performSoundcloudApiSearch(term){
    this._invalidatePrevRequest();
    console.log('set loading true')
    this.props.onLoadingStateChange(true);
    this.prevQueryCancelToken = axios.CancelToken.source();
    let requestPromise = axios.get(
      `http://api.soundcloud.com/tracks?q=${term}&limit=${this.scResultLimit}&streamable=${this.showStreamableOnly}&client_id=${this.SC_CLIENT_ID}`,
      {cancelToken: this.prevQueryCancelToken.token});
    requestPromise.catch((err) => Promise.resolve(err)).then(
      (val) => {
        console.log('resolved with:',val);
        if(axios.isCancel(val)){
          console.log('abort load change');
          return false;
        }
        console.log('set loading false');
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
        streamUrl : `${t.stream_url}?client_id=${this.SC_CLIENT_ID}`,
        artwork : t.artwork_url,
        scUploaderLink : t.user.permalink_url
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
  _onClearSearch(){
    this._onSearchChange('');
  }
  render() {
    let clearButtonOpacity = this.state.searchInput.length;
    return (
      <View style={styles.container}>
        <View style={[styles.clearSearchAction,{opacity:clearButtonOpacity}]}>
          <TouchableOpacity onPress={this._onClearSearch} style={styles.clearSearchTouchable}>
            <Text style={styles.clearSearchActionText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ActivityIndicator animating={this.props.isLoading} style={[styles.loaderStyle]} />
        <View style={styles.searchInputView}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search SoundCloud tracks..."
            value={this.state.searchInput}
            placeholderTextColor={THEME.mainColor}
            onChangeText={this._onSearchChange} />
        </View>
        <TrackList
          tracksData={this.state.pureList.map(this._markAsCurrentTrack)}
          onTrackActionRender={(rowData) => rowData.isCurrentTrack ? null : '+'}
          highlightProp={'isCurrentTrack'}
          onTrackAction={this.props.onSongQueued}
          onTrackSelected={this.props.onSongSelected}
          {...this.props}
          />
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
  }
});

SongPicker.propTypes = {
  onSongSelected: PropTypes.func.isRequired,
  onSongQueued: PropTypes.func,
  onClose: PropTypes.func,
  onSearchTermsChange: PropTypes.func
};

export default SongPicker;
