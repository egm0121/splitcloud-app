import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PickerIOS
} from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
export default function(props){
  return <View style={[styles.itemContainer,props.containerStyle]}>
    <TouchableOpacity onPress={props.onPress}>
      <AppText bold={true} style={[styles.itemText,props.textStyle]}>{props.children}</AppText>
    </TouchableOpacity>
  </View>;
}
let styles =  StyleSheet.create({
  itemContainer:{
    padding:20,
    alignItems:'center',
    borderBottomWidth:1,
    borderBottomColor: THEME.contentBorderColor
  },
  itemText:{
    fontSize:17,
    color:THEME.mainHighlightColor
  }
});
