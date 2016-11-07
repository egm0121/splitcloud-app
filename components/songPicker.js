/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  ListView,
  View,
  TouchableOpacity
} from 'react-native';

const SC_CLIENT_ID = "54921f38ed5d570772c094534b9f50b5";

class SongPicker extends Component {
  constructor(){
    super();

    this._onSearchChange = this._onSearchChange.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this._onSongSelected = this._onSongSelected.bind(this);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      searchInput: '',
      pureList : [],
      renderList: this.ds.cloneWithRows([{label:'No results'}])
    };
  }
  _onSearchChange(text){
    this.performSouncloudApiSearch(text).then(this.updateResultList)
    this.setState({searchInput:text});
  }
  performSouncloudApiSearch(term){
    return fetch(`http://api.soundcloud.com/tracks?q=${term}&client_id=${SC_CLIENT_ID}`, {method: 'GET'})
      .then((resp) => resp.json());
  }
  updateResultList(resp){
    let tracks = resp.filter((t) => t.streamable == true)
        .map((t) => ({label :t.title,streamUrl:`${t.stream_url}?client_id=${SC_CLIENT_ID}`}));
    this.setState({
      pureList : tracks,
      renderList : this.ds.cloneWithRows(tracks)
    })
  }
  _onSongSelected(rowData){
    this.props._onSongSelected(rowData);
  }
  renderRowWithData(rowData) {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{rowData.label} </Text>
        <TouchableOpacity onPress={this.onSongSelected.bind(this,rowData)}>
          <Text style={styles.rowAction}>+</Text>
        </TouchableOpacity>
    </View>);
  }
  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={{height: 40}}
          placeholder="Search songs:"
          onChangeText={this._onSearchChange}
        />
        <ListView contentContainerStyle={styles.list}
          dataSource={this.state.renderList}
          renderRow={this.renderRowWithData.bind(this)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F50'
  },
  list:{
    alignItems: 'flex-start',
    backgroundColor: '#F50',
    flexDirection:'column'
  },
  row : {
    borderColor: '#FFFFFF',
    flex: 1,
    flexDirection:'row'
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
    fontWeight: 'bold'
  }
});
SongPicker.propTypes = {
  onSongSelected: PropTypes.function.isRequired,
};

AppRegistry.registerComponent('SongPicker', () => SongPicker);
