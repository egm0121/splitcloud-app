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
import TrackListContainer from '../containers/trackListContainer';
import UserFinderContainer from '../containers/userFinderContainer';
import TopList from '../components/topList';
import FilterInput from '../components/filterInput';
import BackButton from '../components/backButton';
import {formatDuration} from '../helpers/formatters';

class SongPicker extends Component {
  constructor(props){
    super(props);
    console.log('route name for songPicker',this.props.routeName);
    this._onSearchChange = this._onSearchChange.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this._onClearSearch = this._onClearSearch.bind(this);
    this.isSearchEmpty = this.isSearchEmpty.bind(this);
    this.loadMoreResults = this.loadMoreResults.bind(this);
    this.pageMaxLimit = 20;
    this.state = {
      searchInput: this.props.searchTerms || '',
      offset:0,
      limit:this.pageMaxLimit,
      pureList : []
    };
  }
  componentWillMount(){
    this.scApi = new SoundCloudApi({clientId :this.props.scClientId});
    this.SC_CLIENT_ID = this.props.scClientId ;
    this.scResultLimit = this.props.scResultLimit;
    this.performSearchDebounced = throttle(
      this.performSearchDebounced.bind(this),
      this.props.debounceWait
    );
    //start immediately a search for the initial searchInput value.
    this.performSearchDebounced(this.state.searchInput);
  }
  _onSearchChange(text){
    //call props to notify search terms have changed
    this.props.onSearchTermsChange(text);
    if(!text){
      this._invalidatePrevRequest();
      this.props.onLoadingStateChange(true);
      this.updateResultList(false);
    }
    this.setState({
      searchInput:text,
      limit:this.pageMaxLimit,
      offset:0
    });
  }
  _onClearSearch(){
    this._onSearchChange('');
  }
  performSearchDebounced(text){
    this.performScPublicSearch(text).then(this.updateResultList,(err) => {
      console.log('ignore as old term request',err)
    });
  }
  loadMoreResults(){
    if(!this.state.pureList.length){
      console.log('ignore initial scroll end event')
      return;
    }
    this.setState((state)=> ({offset:state.offset + this.pageMaxLimit}));
  }
  _invalidatePrevRequest(){
    if(this.prevQueryCancelToken){
      this.prevQueryCancelToken.cancel({aborted:true});
    }
  }
  componentDidUpdate(prevProp,prevState){
    if((this.state.searchInput && this.state.searchInput != prevState.searchInput) ||
       (this.state.offset != prevState.offset)){
      console.log('fetch new results offset',this.state.offset);
      this.performScPublicSearch(this.state.searchInput).then((results) => {
        //append results on scroll
        this.updateResultList(results,this.state.offset > 0);
      }).catch((err) => {
        console.log('failed song search request with reason',err);
      });
    }
  }
  updateResultList(resp,appendResults){
    // in case of empty results or no search terms
    if(!resp && !appendResults){
      return this.setState({ pureList : [] });
    }
    this.setState({
      pureList : appendResults ? this.state.pureList.concat(resp) : resp
    });
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
    let requestPromise = this.scApi.searchPublicTracks(
      term,
      this.state.limit,
      this.state.offset,
      {cancelToken : this.generateRequestInvalidationToken().token});
    requestPromise.catch((err) => {
      let isCancel = err.message && err.message.aborted;
      if(!isCancel){
        this.props.onRequestFail(err,'search',term);
      }
      return Promise.resolve(err);
    }).then((val) => {
      if(axios.isCancel(val)) return false;
      this.props.onLoadingStateChange(false);
    });
    return requestPromise;
  }
  render() {
    let clearButtonOpacity = this.isSearchEmpty() ? 0 : 1;
    let spinnerPosition = this.isSearchEmpty() ? styles.pushRightSpinner : {};
    return (
      <View style={styles.container}>
        <ActivityIndicator animating={this.props.isLoading} style={[styles.loaderStyle,spinnerPosition]} />
        <View style={styles.searchInputView}>
          <BackButton style={styles.backButton} onPressed={this.props.onClose} />
          <FilterInput
            inputViewStyle={styles.searchInput}
            inputStyle={styles.searchInputText}
            placeholder="Search song or artist"
            value={this.state.searchInput}
            placeholderTextColor={THEME.mainColor}
            onChangeText={this._onSearchChange}
            onClearFilter={this._onClearSearch} />
        </View>
        {this.isSearchEmpty() ?
        <TopList {...this.props} /> :
        <TrackListContainer {...this.props}
          onEndReached={this.loadMoreResults}
          onEndThreshold={400}
          onHeaderRender={() => {
            return <View style={{flexDirection:'row'}}>
                <View style={{flexDirection:'column',flex:1}}>
                  <UserFinderContainer {...this.props} terms={this.state.searchInput} />
                </View>
              </View>;
          }}
          trackList={this.state.pureList}
          side={this.props.side}
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
    flex:1,
    height: 30,
    marginRight:40,
    paddingRight: 10
  },
  searchInputText:{
    fontSize: 17
  },
  searchInputView :{
    borderColor : THEME.contentBorderColor,
    borderBottomWidth :1,
    backgroundColor: THEME.mainBgColor,
    height: 50,
    flexDirection:'row'
  },
  pushRightSpinner:{
    right:60,
  },
  loaderStyle:{
    position:'absolute',
    right:70,
    top:16,
    zIndex:10
  },
  backButton:{
    width:40,
    paddingTop:14,
    paddingLeft:10,
    zIndex:20
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
  onClose: PropTypes.func,
  onSearchTermsChange: PropTypes.func
};

export default SongPicker;
