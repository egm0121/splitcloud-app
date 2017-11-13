/**
 * @flow
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, View, Text, LayoutAnimation } from 'react-native';
import THEME from '../styles/variables';
function OfflineModeBanner(props){
  LayoutAnimation.configureNext({
    ...LayoutAnimation.Presets.easeInEaseOut,
    duration:100
  });

  return <View style={{flexDirection:'row'}}>
    <View style={[styles.barContainer].concat(props.isOnline ? [styles.hide]:[])}>
      <Text style={styles.barText}>Offline Mode Enabled</Text>
    </View>
  </View>;
}
let styles = StyleSheet.create({
  barContainer:{
    flex:1,
    alignItems: 'center',
    height: 30,
    backgroundColor: THEME.mainActiveColor,
    borderBottomLeftRadius: THEME.viewportBorderRadius,
    borderBottomRightRadius: THEME.viewportBorderRadius
  },
  hide:{
    height: 0
  },
  barText : {
    color: THEME.mainBgColor,
    lineHeight:24,
    fontSize: 15,
    fontWeight:'600'
  }
});
export default OfflineModeBanner;
