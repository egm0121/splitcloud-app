/**
 * @flow
 */
import React, { PropTypes, Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import THEME from '../styles/variables';
function ArtistProfileHeader(props){
  return <View style={styles.headerContainer}>
      <Text
        numberOfLines={1}
        ellipsizeMode={'tail'}
        style={styles.headerText}>
        Discover all tracks by {props.username}
      </Text>
  </View>;
}
let styles = StyleSheet.create({
  headerContainer :{
    height: 60,

    paddingHorizontal:20,
    borderColor : THEME.contentBorderColor,
    borderBottomWidth :2
  },
  headerText : {
    color: THEME.mainHighlightColor,
    fontSize: 18,
    lineHeight: 40,
    fontWeight:'600'
  }
});
export default ArtistProfileHeader;
