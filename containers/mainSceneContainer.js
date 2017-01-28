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
  TouchableWithoutFeedback,
  TouchableHighlight
} from 'react-native';
import THEME from '../styles/variables';
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
    this.modeButtons = [
      {mode:'S',label:'Split'},
      {mode:'L',label:'Top'},
      {mode:'R',label:'Bottom'}
    ];
  }
  _createPanAndMuteState([[firstPan,secondPan],[firstMute,secondMute]] = mapping){
    return {
      players : [{
        pan : firstPan,
        side : 'L',
        muted : firstMute
      },{
        pan : secondPan,
        side : 'R',
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
  renderPlayer(player){
    return <AudioPlayerContainer
       side={player.side}
       pan={player.pan}
       navigator={this.props.navigator}
       muted={player.muted} />
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
             SplitCloud
          </Text>
        </View>
        <View style={styles.player}>
        {this.renderPlayer(this.state.players[0])}
        </View>
        <View style={styles.panToggleContainer}>
          <View style={styles.horizontalContainer}>
            {this.modeButtons.map((e,i) => {
               const isSelectedStyle = e.mode === this.state.mode ? [styles.panModeSelected] : [];
               return <TouchableHighlight style={styles.container} key={i}
                        onPress={this._onSideSelectorPressed.bind(this,e.mode)}>
                        <View>
                          <Text style={[styles.textSplitControls].concat(isSelectedStyle)}>{e.label}</Text>
                        </View>
                </TouchableHighlight>;
            })}
          </View>
        </View>
          <View style={styles.player}>
            {this.renderPlayer(this.state.players[1])}
          </View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.mainBgColor,
    paddingTop: 10
  },
  header :{
    borderBottomWidth: 1,
    borderBottomColor: THEME.contentBorderColor
  },
  headerText: {
    fontSize: 25,
    textAlign: 'center',
    color: THEME.mainHighlightColor,
    lineHeight:45,
    height: 50,
    fontWeight:'200'
  },
  player:{
    flex:6,
  },
  panToggleContainer:{
    flex:1,
    borderWidth: 0.5,
    borderLeftWidth:0,
    borderRightWidth:0,
    borderColor: THEME.contentBorderColor
  },
  panModeSelected:{
    color:THEME.mainHighlightColor
  },
  horizontalContainer:{
    flex:1,
    flexDirection:'row'
  },
  textSplitControls:{
    textAlign:'center',
    fontSize:18,
    lineHeight:20,
    color : THEME.mainColor
  },
  splitModeActive:{
    borderBottomWidth:1,
    borderBottomColor: THEME.activeBorderColor
  }
});

AppRegistry.registerComponent('MainSceneContainer', () => MainSceneContainer);

export default MainSceneContainer;
