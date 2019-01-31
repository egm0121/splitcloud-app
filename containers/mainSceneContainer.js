/**
 * @flow
 */
/* global __DEV__ */
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  TouchableHighlight,
  LayoutAnimation,
  Linking,
} from 'react-native';
import config from '../helpers/config';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import THEME from '../styles/variables';
import AudioPlayerContainer from './audioPlayerContainer';
import Button from '../components/button';
import { playbackModeTypes } from '../helpers/constants';
import { connect } from 'react-redux';
import { changePlaybackMode, invertPlayerSideMapping } from '../redux/actions/playbackModeActions';
import { persistor } from '../redux/store/configure';
import AppText from '../components/appText';
const {
  SC_CLIENT_ID,
  SC_CLIENT_SECRET,
  SC_OAUTH_REDIRECT_URI
} = config;


class MainSceneContainer extends Component {
  constructor(props){
    super(props);
    this.onLoginStart = this.onLoginStart.bind(this);
    this.purgeStore = this.purgeStore.bind(this);
    this.renderPlaybackModeTabBar = this.renderPlaybackModeTabBar.bind(this);
    this.switchPlaybackSide = this.switchPlaybackSide.bind(this);
    this.initialButtonsState = {
      modeButtons : [
        {label:'INVERT'},
        {mode:'L',label:'LEFT'},
        {mode:'S',label:'SPLIT'},
        {mode:'R',label:'RIGHT'}
      ]
    };
    this.state = this.initialButtonsState;
  }
  componentWillReceiveProps(newProps){
    this.setState(newProps.isInverted ?
      this.invertModeButtons(this.initialButtonsState):
      {...this.initialButtonsState}
    );
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
  invertModeButtons(state){
    let toArr = [...state.modeButtons];
    let temp = state.modeButtons[1];
    toArr[1] = toArr[3];
    toArr[3] = temp;
    return {
      ...state,
      modeButtons : toArr
    };
  }
  switchPlaybackSide(){
    console.log('switch order')
    if(this.state.modeButtons[1].mode == 'L'){
      this.setState(this.invertModeButtons(this.initialButtonsState));
      this.props.onInvertPlayerSide(true);
    } else {
      this.setState({...this.initialButtonsState});
      this.props.onInvertPlayerSide(false);
    }
  }
  renderPlaybackModeTabBar(){
    return <View>
      <View style={styles.horizontalContainer}>
        {this.state.modeButtons.map((e,i) => {
          const isSelected = e.mode === this.props.mode;
          const isSelectedStyle = isSelected ? [styles.panModeSelected] : [];
          if(!e.mode){
            if(this.props.mode != 'S') return null;
            let invertImage = this.props.isInverted ?
                require('../assets/invert_fill_active.png') :
                require('../assets/invert_fill.png');
            return <Button style={styles.invertSwitchStyle}
               image={invertImage}
               size={'small'}
               key={i}
               onPressed={this.switchPlaybackSide} />
          }
          if( this.props.mode != 'S' && (!isSelected && e.mode != 'S')) return null;
          const imageMap = {
            'L':{
              'on':require('../assets/player_top_on.png'),
              'off':require('../assets/player_top_off.png')
            },
            'R':{
              'on':require('../assets/player_bottom_on.png'),
              'off':require('../assets/player_bottom_off.png')
            },
            'S':{
              'on':require('../assets/player_split_on.png'),
              'off': require('../assets/player_split_off.png')
            }
          };
          const buttonImage = imageMap[e.mode][isSelected ? 'on': 'off'];
          return <TouchableHighlight style={styles.panButtoncontainer} key={i}
                  onPress={this.props.onModeSelected.bind(this,e.mode)}>
                  <View>
                  <Button style={styles.buttonImageStyle}
                    image={buttonImage}
                    size={'small'}
                    key={i}
                    onPressed={this.props.onModeSelected.bind(this,e.mode)} />
                  </View>
            </TouchableHighlight>
          // return <View style={styles.panButtoncontainer}  key={i} >
          // <Button style={styles.buttonImageStyle}
          //   image={buttonImage}
          //   size={'small'}
          //   onPressed={this.props.onModeSelected.bind(this,e.mode)} />
          // </View>
        })}
      </View>
    </View>;
  }
  render() {
    let playerLStyle = [], playerRStyle = [], fullScreenContainerStyle;
    if(this.props.mode != 'S'){
      playerLStyle = this.props.mode == 'L' ?
          styles.expandedPlayer : styles.minimizedPlayer;
      playerRStyle = this.props.mode == 'R' ?
          styles.expandedPlayer : styles.minimizedPlayer;
      fullScreenContainerStyle = {paddingTop:0}; 
    }
    return (
      <View style={[styles.container,fullScreenContainerStyle]}>
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
    ...ifIphoneX({paddingTop:35},{paddingTop:20})
  },
  headerText: {
    textAlign: 'center',
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
  horizontalContainer:{
    flexDirection:'row',
  },
  panButtoncontainer:{
    flex:1,
    height:35,

    alignItems:'center',
    justifyContent:'center'
  },
  textSplitControls:{
    textAlign:'center',
    fontSize:15,
    lineHeight:20,
    color : THEME.mainColor
  },
  buttonImageStyle:{
    flex:1,
    height:35,
    alignItems:'center',
    justifyContent:'center',
  },
  invertSwitchStyle:{
    flex:1,
    height:35,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#2e2e2e'
  },
  panModeSelected:{
    color:THEME.mainActiveColor
  }
});
let mapStateToProps  =  (state) => {
  return { mode : state.mode , players: state.players , isInverted : state.players[0].inverted};
};
let mapDispatchToProps = (dispatch) => {
  return {
    onModeSelected(mode){
      LayoutAnimation.configureNext({...LayoutAnimation.Presets.easeInEaseOut,duration:300});
      dispatch(changePlaybackMode(mode))
    },
    onInvertPlayerSide(inverted){
      dispatch(invertPlayerSideMapping(inverted));
    }
  }
};

const ConnectedMainSceneContainer = connect(mapStateToProps,mapDispatchToProps)(MainSceneContainer);

AppRegistry.registerComponent('MainSceneContainer', () => ConnectedMainSceneContainer);

export default ConnectedMainSceneContainer;
