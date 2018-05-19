import React, { PropTypes, Component } from 'react';
import { StyleSheet, View, Text,TouchableOpacity  } from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
export default function SectionItem(props){
  let isActiveStyle = props.active == props.name ? styles.itemSelected:null;
  if(props.forceActive) isActiveStyle = styles.itemSelected;
  return <TouchableOpacity
    key={props.key}
    style={props.style}
    onPress={() => { props.onSelected(props.name)}}>
    <AppText bold={true} style={[styles.itemText,isActiveStyle,props.textStyle]}>{props.label}</AppText>
  </TouchableOpacity> ;
}
SectionItem.defaultProps = {
  onSelected : () => {}
};
const styles = StyleSheet.create({
  itemText : {
    color: THEME.mainColor,
    fontSize: 18,
    paddingRight:20
  },
  itemSelected:{
    color: THEME.mainHighlightColor
  }
});
