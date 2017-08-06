/**
 * @flow
 */
/* global __DEV__ */
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
  LayoutAnimation,
  Linking,
  Image
} from 'react-native';
import config from '../helpers/config';
import THEME from '../styles/variables';
import AudioPlayerContainer from './audioPlayerContainer';
import NotificationOverlay from '../components/notificationOverlay';
import { playbackModeTypes } from '../helpers/constants';
import { connect } from 'react-redux';
import { changePlaybackMode } from '../redux/actions/playbackModeActions';
import { persistor } from '../redux/store/configure';
const {
  SC_CLIENT_ID,
  SC_CLIENT_SECRET,
  SC_OAUTH_REDIRECT_URI
} = config;
class MainSceneContainer extends Component {
  constructor(props){
    super(props);
    this.handleOpenURL = this.handleOpenURL.bind(this);
    this.onLoginStart = this.onLoginStart.bind(this);
    this.purgeStore = this.purgeStore.bind(this);
    this.renderPlaybackModeTabBar = this.renderPlaybackModeTabBar.bind(this);

    this.modeButtons = [
      {mode:'L',label:'LEFT'},
      {mode:'S',label:'SPLIT'},
      {mode:'R',label:'RIGHT'}
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
  onLoginStart(){
    Linking.openURL([
      'https://soundcloud.com/connect',
      '?response_type=code',
      '&client_id=' + SC_CLIENT_ID,
      '&client_secret=' + SC_CLIENT_SECRET,
      '&display=popup',
      '&redirect_uri=' + SC_OAUTH_REDIRECT_URI
    ].join(''))
  }
  purgeStore(){
    persistor.purge();
  }
  isSplitMode(){
    return this.props.mode == playbackModeTypes.SPLIT;
  }
  renderPlayer(player){
    return <AudioPlayerContainer side={player.side} {...this.props} />
  }
  getFullScreenPlayer(){
    if(this.props.mode == playbackModeTypes.SPLIT) return false;
    return { side : this.props.mode };
  }
  renderPlaybackModeTabBar(){
    return <View style={styles.panToggleContainer}>
      <View style={styles.horizontalContainer}>
        {this.modeButtons.map((e) => {
          const isSelectedStyle = e.mode === this.props.mode ? [styles.panModeSelected] : [];
          return <TouchableHighlight style={styles.container} key={e.mode}
                  onPress={this.props.onModeSelected.bind(this,e.mode)}>
                  <View>
                    <Text style={[styles.textSplitControls].concat(isSelectedStyle)}>{e.label}</Text>
                  </View>
            </TouchableHighlight>;
        })}
      </View>
    </View>;
  }
  render() {
    let playerLStyle = [],
      playerRStyle = [];
    if(this.props.mode != 'S'){
      playerLStyle = this.props.mode == 'L' ?
          styles.expandedPlayer : styles.minimizedPlayer;
      playerRStyle = this.props.mode == 'R' ?
          styles.expandedPlayer : styles.minimizedPlayer;
    }
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image style={styles.appLogo} source={require('../assets/splitcloud.logo.png')} resizeMode={'contain'}/>
          {/*<TouchableHighlight onPress={this.onLoginStart} >
            <Text style={{color:'gray'}}>Login</Text>
          </TouchableHighlight>*/}
          {__DEV__ ?
          <TouchableHighlight style={{position:'absolute',top:5,zIndex:10}} onPress={this.purgeStore}>
            <Text style={{color:'gray'}}>Purge store</Text>
          </TouchableHighlight> :null
          }
        </View>
        <View style={[styles.player,playerLStyle]}>
          {this.renderPlayer(this.props.players[0])}
        </View>
        {this.isSplitMode() ? <View style={styles.separator}></View> : null}
        <View style={[styles.player,playerRStyle]}>
          {this.renderPlayer(this.props.players[1])}
        </View>
        {this.renderPlaybackModeTabBar()}
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
  appLogo:{
    alignSelf:'center',
    marginBottom:8,
    marginTop:17,
    height:25
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
  expandedPlayer:{
    flex:12
  },
  minimizedPlayer:{
    height:0,
    flex:0
  },
  separator:{
    height:1,
    backgroundColor: THEME.contentBorderColor
  },
  panToggleContainer:{
    height:40,
    borderWidth: 2,
    borderLeftWidth:0,
    borderRightWidth:0,
    borderBottomWidth:0,
    borderColor: THEME.contentBorderColor
  },
  horizontalContainer:{
    flex:1,
    flexDirection:'row'
  },
  textSplitControls:{
    textAlign:'center',
    fontSize:15,
    lineHeight:18,
    fontWeight:'400',
    color : THEME.mainColor
  },
  panModeSelected:{
    color:THEME.mainActiveColor,
    fontWeight:'600',
  }
});
let mapStateToProps  =  (state) => {
  return { mode : state.mode , players: state.players };
};
let mapDispatchToProps = (dispatch) => {
  return {
    onModeSelected(mode){
      LayoutAnimation.configureNext({...LayoutAnimation.Presets.easeInEaseOut,duration:300});
      dispatch(changePlaybackMode(mode))
    }
  }
};

const ConnectedMainSceneContainer = connect(mapStateToProps,mapDispatchToProps)(MainSceneContainer);

AppRegistry.registerComponent('MainSceneContainer', () => ConnectedMainSceneContainer);

export default ConnectedMainSceneContainer;
