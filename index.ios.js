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
import { ReactNativeAudioStreaming, Player } from 'react-native-audio-streaming';
const SC_CLIENT_ID = "54921f38ed5d570772c094534b9f50b5";
const songAssetOneUrl = 'http://api.soundcloud.com/tracks/267983531/stream?client_id=54921f38ed5d570772c094534b9f50b5';
const songAssetTwoUrl = 'http://api.soundcloud.com/tracks/258502248/stream?client_id=54921f38ed5d570772c094534b9f50b5';


class Example extends Component {
  constructor(){
    super();
    this._onSideOnePress = this._onSideOnePress.bind(this);
    this._onSideTwoPress = this._onSideTwoPress.bind(this);
    this._onSearchChange = this._onSearchChange.bind(this);
    this.updateResultList = this.updateResultList.bind(this);
    this._onSongSelected = this._onSongSelected.bind(this);

    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      playSideA:false,
      playSideB:false,
      playerATrack: {
        url:songAssetOneUrl
      },
      playerBTrack: {
        url:songAssetTwoUrl
      },
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
  _onSongSelected(rowData,playerName){
    if(playerName == 'A') {
      this.setState({

        playerATrack: rowData,
        playSideA : false
      });
      ReactNativeAudioStreaming.stopwithKey(1);
    } else {
      this.setState({
        playerBTrack : rowData,
        playSideB : false
      });
      ReactNativeAudioStreaming.stopwithKey(2);
    }

  }
  _onSideOnePress(){
    if(this.state.playSideA){
      ReactNativeAudioStreaming.stopwithKey(1);
      this.setState({playSideA:false});
    } else {
      ReactNativeAudioStreaming.createPlayer(1);
      ReactNativeAudioStreaming.setPan(1,-1);
      ReactNativeAudioStreaming.playUrl(this.state.playerATrack.streamUrl,1);
      this.setState({playSideA:true});
    }

  }
  _onSideTwoPress(){
    if(this.state.playSideB){
      ReactNativeAudioStreaming.stopwithKey(2);
      this.setState({playSideB:false});
    } else {
      ReactNativeAudioStreaming.createPlayer(2);
      ReactNativeAudioStreaming.setPan(2,1);
      ReactNativeAudioStreaming.playUrl(this.state.playerBTrack.streamUrl,2);
      this.setState({playSideB:true});
    }

  }
  renderRowWithData(rowData) {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{rowData.label} </Text>
        <TouchableOpacity onPress={this._onSongSelected.bind(this,rowData,'A')}>
          <Text style={styles.rowAction}>Load A</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this._onSongSelected.bind(this,rowData,'B')}>
          <Text style={styles.rowAction}> Load B</Text>
        </TouchableOpacity>
    </View>);
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>
           SplitCloud
        </Text>
        <TextInput
          style={{height: 40}}
          placeholder="Search songs:"
          onChangeText={this._onSearchChange}
        />

        <ListView contentContainerStyle={styles.list}
          dataSource={this.state.renderList}
          renderRow={this.renderRowWithData.bind(this)}
        />
        <TouchableOpacity style={styles.container} onPress={this._onSideOnePress}>
          <Text style={styles.welcome}>{this.state.playerATrack.label}</Text>
          <Text style={styles.welcome}>
            {this.state.playSideA ? 'Stop' : 'Play'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.container} onPress={this._onSideTwoPress}>
          <Text style={styles.welcome}>{this.state.playerBTrack.label}</Text>
          <Text style={styles.welcome}>
            {this.state.playSideB ? 'Stop' : 'Play'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F50'
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    margin: 10,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FFFFFF',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
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
    color: '#FFFFFF'
  }
});

AppRegistry.registerComponent('Example', () => Example);
