/**
 * @flow
 */
import React from 'react';
import { StyleSheet, View, } from 'react-native';
import {
  AdMobBanner,
} from 'react-native-admob';
import THEME from '../styles/variables';
import { isIphoneX } from 'react-native-iphone-x-helper';
import AppText from './appText';
function AdMobBottomBanner(props){
  return <View style={{flexDirection:'row'}}>
    <View style={[styles.barContainer]}>
      <AdMobBanner
      adSize="smartBannerPortrait"
      adUnitID="ca-app-pub-8685101882223767/5553267369"
      testDevices={[AdMobBanner.simulatorId]}
      onAdFailedToLoad={error => console.warn(error)}
      />
    </View>
  </View>;
}
let styles = StyleSheet.create({
  barContainer:{
    flex:1,
    alignItems: 'center',
    height: 50,
    backgroundColor: THEME.tabBarBorderColor,
    marginBottom: isIphoneX() ? 20 : 0,
  },
  barText : {
    color: THEME.mainBgColor,
    lineHeight:24,
    fontSize: 15,
  }
});
export default AdMobBottomBanner;