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
import debounce from 'lodash.debounce';
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
    this._onSearchTermsChange = debounce(this._onSearchTermsChange.bind(this),this.props.debounceWait);
  }
  _onSearchTermsChange(text){
    this.performSoundcloudApiSearch(text).then(this.updateResultList);
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
    return fetch(`http://api.soundcloud.com/tracks?q=${term}&limit=${this.scResultLimit}&streamable=${this.showStreamableOnly}&client_id=${this.SC_CLIENT_ID}`,
      {method: 'GET'})
      .then((resp) => resp.json());
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
    this.props.onSongSelected(rowData);
  }
  _onSongQueued(rowData){
    this.props.onSongQueued(rowData);
  }
  _onClose(){
    this.props.onClose();
  }
  renderRowWithData(rowData) {
    return (
      <View style={styles.row}>
        <TouchableOpacity style={styles.rowLabel} onPress={this._onSongSelected.bind(this,rowData)}>
          <Text style={styles.rowLabelText}>{rowData.label} </Text>
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
    backgroundColor: '#F50'
  },
  searchInput : {
    height: 40,
    color: 'white',
    paddingLeft: 10
  },
  searchInputView :{
    borderColor : 'white',
    borderBottomWidth :1
  },
  list:{
    alignItems: 'flex-start',
    backgroundColor: '#F50',
    flexDirection:'column'
  },
  row : {
    borderColor: '#FFFFFF',
    flex: 1,
    flexDirection:'row',
    height:40,
    paddingLeft: 20
  },
  rowLabel : {
    flex: 10
  },
  rowLabelText: {
    color: '#FFFFFF',
    lineHeight:30,
    height: 40,
    fontSize: 17,
    paddingTop:5,
    paddingBottom:5
  },
  rowAction : {
    flex: 1
  },
  rowActionText :{
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight:40
  },
  footer : {
    borderColor : 'white',
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
