/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Share,
  Image,
} from 'react-native';

import THEME from '../styles/variables'
import BackButton from '../components/backButton';
import HeaderBar from '../components/headerBar';
import AppText from '../components/appText';
class ShareAppScreen extends Component {
  constructor(props){
    super(props);
    console.log('ShareAppScreen mounted');
  }
  render() {
    return (
      <View style={styles.container}>
        <HeaderBar title={'Share SplitCloud App!'}>
          <BackButton style={styles.backButton} onPressed={this.props.onClose} />
        </HeaderBar>
        <View style={styles.infoContainer}>
          <Image style={styles.heroImg} resizeMode={'contain'} source={require('../assets/badge_with_text.png')} />
          <View style={styles.infoTextContainer}>
            <AppText bold={true} style={styles.infoTitle}>Help your friends discover SplitCloud!</AppText>
            <AppText style={styles.infoDesc}>{
            'If you enjoy using SplitCloud please support it by sharing the app link on your social platforms and by inviting your friends to try it!'}
            </AppText>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer:{
    flexDirection:'row',
  },
  backButton:{
    position:'absolute',
    left:0,
    paddingLeft:10,
    top:10,
    zIndex:20
  },
  heroImg:{
    flex:1,
    width:null,
    height:null,
  },
  infoContainer:{
    flex:1,
    paddingTop:40,
    backgroundColor: THEME.mainBgColor,
  },
  infoTextContainer:{
    flex:1,
  },
  infoTitle:{
    color: THEME.mainHighlightColor,
    fontSize: 18,
    lineHeight: 30,
    textAlign:'center',
    paddingVertical:20,
  },
  infoDesc:{
    color: THEME.mainHighlightColor,
    fontSize: 15,
    lineHeight: 20,
    fontWeight:'400',
    paddingHorizontal:20,
  }
});

export default ShareAppScreen;
