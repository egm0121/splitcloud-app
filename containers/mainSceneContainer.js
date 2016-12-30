/**
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';

import AudioPlayerContainer from './audioPlayerContainer';

class MainSceneContainer extends Component {
  constructor(){
    super();
    this.state = {
      mode : 'S',
      players : [{
        side:'L',
        pan :-1,
        muted : 0
      },{
        side:'R',
        pan : 1,
        muted : 0
      }]
    };

  }
  _createPanAndMuteState([[firstPan,secondPan],[firstMute,secondMute]] = mapping){
    return {
      players : [{
        pan : firstPan,
        muted : firstMute
      },{
        pan : secondPan,
        muted : secondMute
      }]
    };
  }
  _onSideSelectorPressed(mode){

    const modeToPanAndMute = {
      'S':[[-1,1],[0,0]],
      'L':[[0,1],[0,1]],
      'R':[[-1,0],[1,0]]
    };

    this.setState(this._createPanAndMuteState(modeToPanAndMute[mode]))
    this.setState({mode:mode});
  }
  render() {

    return (
      <View style={styles.container}>
        <Text style={styles.header}>
           SplitCloud
        </Text>
        {
          this.state.players.map((player,i) => {
           return <AudioPlayerContainer style={styles.player}
              side={player.side}
              pan={player.pan}
              navigator={this.props.navigator}
              muted={player.muted}
              key={i} />
          })
        }
        <View style={styles.horizontalContainer}>
          <TouchableOpacity style={styles.container} onPress={this._onSideSelectorPressed.bind(this,'S')}>
            <Text style={styles.textCenter} >Split</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.container} onPress={this._onSideSelectorPressed.bind(this,'L')}>
            <Text style={styles.textCenter} >Top</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.container} onPress={this._onSideSelectorPressed.bind(this,'R')}>
            <Text style={styles.textCenter} >Bottom</Text>
          </TouchableOpacity>
        </View>
        <Text>playback mode : {this.state.mode}</Text>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F50',
    paddingTop: 20
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    margin: 10,
  },
  player:{
    flex:1
  },
  horizontalContainer: {
    flexDirection: 'row',
    margin:40,
    backgroundColor: '#F50',
  },
  textCenter :{
    textAlign:'center'
  }
});

AppRegistry.registerComponent('MainSceneContainer', () => MainSceneContainer);

export default MainSceneContainer;
