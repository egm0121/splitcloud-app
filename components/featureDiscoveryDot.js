/**
 * @flow
 */
import React, { PropTypes } from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
import theme from '../styles/variables';
function featureDiscoveryDot(){
  return <View style={styles.dot} ></View>;
}
featureDiscoveryDot.propTypes = {};
const styles = StyleSheet.create({
  dot:{
    position:'absolute',
    width:12,
    height:12,
    top:0,
    left:3,
    borderWidth:6,
    borderRadius:6,
    borderColor: theme.mainActiveColor,
    shadowOffset:{  width: 0,  height: 0,  },
    shadowColor: theme.mainActiveColor,
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
export default featureDiscoveryDot;
