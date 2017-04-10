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
  TouchableHighlight,
  Linking
} from 'react-native';
import THEME from '../styles/variables';
import AudioPlayerContainer from './audioPlayerContainer';
import { connect } from 'react-redux';
import { changePlaybackMode } from '../redux/actions/playbackModeActions';
class MainSceneContainer extends Component {
  constructor(props){
    super(props);
    this.handleOpenURL = this.handleOpenURL.bind(this);
    this.state = {
      mode : 'S',
      players : [{
        side:'L'
      },{
        side:'R'
      }]
    };
    this.modeButtons = [
      {mode:'S',label:'Split'},
      {mode:'L',label:'Top'},
      {mode:'R',label:'Bottom'}
    ];


  }
  componentDidMount(){
    Linking.addEventListener('url', this.handleOpenURL);
  }
  componentWillUnmount(){
    Linking.removeEventListener('url', this.handleOpenURL);
  }
  handleOpenURL(){
    console.log('handle openURL called',arguments)
  }
  renderPlayer(player){
    return <AudioPlayerContainer
       side={player.side}
       navigator={this.props.navigator} />
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
               const isSelectedStyle = e.mode === this.props.mode ? [styles.panModeSelected] : [];
               return <TouchableHighlight style={styles.container} key={i}
                        onPress={this.props.onModeSelected.bind(this,e.mode)}>
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
    borderBottomWidth: 2,
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
    flex:6
  },
  panToggleContainer:{
    flex:1,
    borderWidth: 1,
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
  }
});
let mapStateToProps  =  (state) => {
  return { mode : state.mode , players: state.pla };
};
let mapDispatchToProps = (dispatch) => {
  return {
    onModeSelected(mode){
      dispatch(changePlaybackMode(mode))
    }
  }
};

MainSceneContainer = connect(mapStateToProps,mapDispatchToProps)(MainSceneContainer);

AppRegistry.registerComponent('MainSceneContainer', () => MainSceneContainer);

export default MainSceneContainer;
