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

class SongPicker extends Component {
  constructor(){
    super();

    this._onSearchChange = this._onSearchChange.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this._onSongSelected = this._onSongSelected.bind(this);
    this._onClose = this._onClose.bind(this);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.SC_CLIENT_ID = null;
    this.state = {
      searchInput: '',
      pureList : [],
      renderList: this.ds.cloneWithRows([{label:'No results'}])
    };
  }
  componentWillMount(){
    this.SC_CLIENT_ID = this.props.scClientId;
    this.scResultLimit = this.props.scResultLimit;
    this.showStreamableOnly = this.props.showStreamableOnly;
  }
  _onSearchChange(text){
    this.performSouncloudApiSearch(text).then(this.updateResultList)
    this.setState({searchInput:text});
  }
  performSouncloudApiSearch(term){
    return fetch(`http://api.soundcloud.com/tracks?q=${term}&limit=${this.scResultLimit}&streamable=${this.showStreamableOnly}&client_id=${this.SC_CLIENT_ID}`,
      {method: 'GET'})
      .then((resp) => resp.json());
  }
  updateResultList(resp){
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
  _onClose(){
    this.props.onClose();
  }
  renderRowWithData(rowData) {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{rowData.label} </Text>
        <TouchableOpacity onPress={this._onSongSelected.bind(this,rowData)}>
          <Text style={styles.rowAction}>+</Text>
        </TouchableOpacity>
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

        <TouchableOpacity onPress={this._onClose.bind(this)}>
          <Text style={styles.closeAction}>Close</Text>
        </TouchableOpacity>
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
    color: 'white'
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
    height:30
  },
  rowLabel : {
    flex: 4,
    color: '#FFFFFF',
    lineHeight:20,
    height: 20
  },
  rowAction : {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20
  },
  closeAction : {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: 'bold',
    height: 40
  }
});

SongPicker.propTypes = {
  onSongSelected: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

export default SongPicker;
