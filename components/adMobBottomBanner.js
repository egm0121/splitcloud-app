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

function AdMobBottomBanner(props){
  const { adDisabled } = props;
  const containerStyle = adDisabled ? 
    styles.disabledBarContainer :
    styles.barContainer;
  return <View style={{flexDirection:'row'}}>
    <View style={[containerStyle]}>
      {!adDisabled && <AdMobBanner
      adSize="smartBannerPortrait"
      adUnitID="ca-app-pub-8685101882223767/5553267369"
      testDevices={[AdMobBanner.simulatorId]}
      onAdFailedToLoad={error => console.warn(error)}
      />}
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
  disabledBarContainer:{
    flex:1,
    height: isIphoneX() ? 21 : 0,
    backgroundColor: THEME.mainBgColor,
  },
  barText : {
    color: THEME.mainBgColor,
    lineHeight:24,
    fontSize: 15,
  }
});
export default AdMobBottomBanner;