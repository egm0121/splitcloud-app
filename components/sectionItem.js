import React, { PropTypes, Component } from 'react';
import { StyleSheet, View, Text,TouchableOpacity  } from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
export default function SectionItem(props){
  let isActive = props.active == props.name ;
  let isActiveStyle = isActive ? styles.itemSelected:null;
  const isF = (f) => typeof f === 'function';
  let isIconLabel;
  let itemSelectedContainer = props.active == props.name ? styles.itemSelectedContainer:null;
  if(props.forceActive) isActiveStyle = styles.itemSelected;
  if(props.children) isIconLabel = styles.iconLabel;
  return <TouchableOpacity
    key={props.key}
    style={[props.style,styles.container,itemSelectedContainer]}
    onPress={() => { props.onSelected(props.name)}}>
    { isF(props.children) && props.children(isActive)}
    <AppText bold={!isIconLabel} style={[styles.itemText,isActiveStyle,props.textStyle,isIconLabel]}>{props.label}</AppText>
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
  iconLabel:{
    flex:1,
    fontSize: 13,
    paddingRight:0,
  },
  container:{
    opacity: 0.7
  },
  itemSelectedContainer:{
    opacity:1
  },
  itemSelected:{
    color: THEME.mainHighlightColor
  }
});
