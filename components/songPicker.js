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
  TouchableOpacity
} from 'react-native';
import throttle from 'lodash.throttle';
import axios from 'axios';
import THEME from '../styles/variables';
const EMPTY_RESULT_ROW =  [{label:'No results',isEmpty:true}];
const SEARCH_INPUT_PLACEHOLDER = '';
class SongPicker extends Component {
  constructor(){
    super();

    this._onSearchChange = this._onSearchChange.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this._onSongSelected = this._onSongSelected.bind(this);
    this._onSongQueued = this._onSongQueued.bind(this);
    this._onClose = this._onClose.bind(this);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.SC_CLIENT_ID = null;
    this.state = {
      searchInput: '',
      pureList : [],
      renderList: this.ds.cloneWithRows(EMPTY_RESULT_ROW)
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
  }
  _onSearchTermsChange(text){
    this.performSoundcloudApiSearch(text).then(this.updateResultList,(err) => {
      console.log('ignore as old term request',err)
    });
  }
  _onSearchChange(text){
    if(text){
      this._onSearchTermsChange(text);
    } else {
      this.updateResultList(false);
    }
    this.setState({searchInput:text});
  }
  performSoundcloudApiSearch(term){
    if(this.prevQueryCancelToken){
      this.prevQueryCancelToken.cancel('Old Query, invalidate request');
    }
    this.prevQueryCancelToken = axios.CancelToken.source();
    return axios.get(
      `http://api.soundcloud.com/tracks?q=${term}&limit=${this.scResultLimit}&streamable=${this.showStreamableOnly}&client_id=${this.SC_CLIENT_ID}`,
      {cancelToken: this.prevQueryCancelToken.token})
    .then((resp) => resp.data);
  }
  updateResultList(resp){
    // in case of empty results or no search terms
    if(!resp){
      return   this.setState({
          pureList : EMPTY_RESULT_ROW,
          renderList : this.ds.cloneWithRows(EMPTY_RESULT_ROW)
        });
    }
    let tracks = resp.map((t) => (
      {label : t.title,
       streamUrl : `${t.stream_url}?client_id=${this.SC_CLIENT_ID}`,
       artwork : t.artwork_url
      })
    );
    this.setState({
      pureList : tracks,
      renderList : this.ds.cloneWithRows(tracks)
    })
  }
  _onSongSelected(rowData){
    if(!rowData.isEmpty){
        this.props.onSongSelected(rowData);
    }
  }
  _onSongQueued(rowData){
    if(!rowData.isEmpty){
      this.props.onSongQueued(rowData);
    }
  }
  _onClose(){
    this.props.onClose();
  }
  renderRowWithData(rowData) {
    const rowTextStyle = rowData.isEmpty ? [styles.placeholderRowText] : [];
    return (
      <View style={styles.row}>
          <TouchableOpacity style={styles.rowLabel} onPress={this._onSongSelected.bind(this,rowData)}>
            <Text numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowLabelText].concat(rowTextStyle)} >{rowData.label} </Text>
          </TouchableOpacity>
        <View style={styles.rowAction}>
          <TouchableOpacity onPress={this._onSongQueued.bind(this,rowData)}>
            {rowData.isEmpty ? null : <Text style={styles.rowActionText}>+</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchInputView}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs:"
          placeholderTextColor={THEME.mainColor}
          onChangeText={this._onSearchChange} />
        </View>
        <ListView contentContainerStyle={styles.list}
          dataSource={this.state.renderList}
          renderRow={this.renderRowWithData.bind(this)} />
        <View style={styles.footer}>
          <TouchableOpacity onPress={this._onClose.bind(this)}>
            <Text style={styles.closeAction}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: THEME.mainBgColor
  },
  searchInput : {
    height: 40,
    color: THEME.mainHighlightColor,
    paddingLeft: 10
  },
  searchInputView :{
    borderColor : THEME.contentBorderColor,
    borderBottomWidth :2
  },
  list:{
    alignItems: 'flex-start',
    backgroundColor: THEME.contentBgColor,
    flexDirection:'column'
  },
  row : {
    flex: 1,
    flexDirection:'row',
    height:40,
    paddingLeft: 20
  },
  rowLabel : {
    flex: 9,
    height: 40,
    borderColor: THEME.listBorderColor,
    borderBottomWidth:0.5
  },
  rowLabelText: {
    color: THEME.mainHighlightColor,
    lineHeight:30,
    fontSize: 17
  },
  placeholderRowText:{
    textAlign :'center',
    color:THEME.mainColor
  },
  rowAction : {
    flex: 1,
  },
  rowActionText :{
    color: THEME.mainHighlightColor,
    fontSize: 30,
    lineHeight:38,
    textAlign : 'center'
  },
  footer : {
    borderColor : THEME.contentBorderColor,
    borderTopWidth :1
  },
  closeAction : {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: 'bold',
    height: 40,
    padding: 10
  }
});

SongPicker.propTypes = {
  onSongSelected: PropTypes.func.isRequired,
  onSongQueued: PropTypes.func,
  onClose: PropTypes.func
};

export default SongPicker;
