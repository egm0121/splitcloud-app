/**
 * @flow
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, View, Text, LayoutAnimation } from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
function OfflineModeBanner(props){
  LayoutAnimation.configureNext({
    ...LayoutAnimation.Presets.easeInEaseOut,
    duration:100
  });

  return <View style={{flexDirection:'row'}}>
    <View style={[styles.barContainer].concat(props.isOnline ? [styles.hide]:[])}>
      <AppText bold={true} style={styles.barText}>Offline</AppText>
    </View>
  </View>;
}
let styles = StyleSheet.create({
  barContainer:{
    flex:1,
    alignItems: 'center',
    height: 23,
    backgroundColor: THEME.mainActiveColor,
  },
  hide:{
    height: 0
  },
  barText : {
    color: THEME.mainBgColor,
    lineHeight:20,
    fontSize: 13,
  }
});
export default OfflineModeBanner;
