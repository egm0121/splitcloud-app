/**
 * @flow
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import THEME from '../styles/variables';
function OfflineModeBanner(props){
  return <View style={{flexDirection:'row'}}>
    <View style={styles.barContainer}>
      <Text>You are currently offline</Text>
    </View>
  </View>;
}
let styles = StyleSheet.create({
  barContainer:{
    flex:1,
    alignItems: 'center',
    height: 30,
    backgroundColor: THEME.mainActiveColor,
    borderColor : THEME.contentBorderColor,
    borderTopWidth :2
  },
  barText : {
    color: THEME.mainActiveColor,
    fontSize: 12,
    fontWeight:'600'
  }
});
export default OfflineModeBanner;
