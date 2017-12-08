import React, { PropTypes, Component } from 'react';
import { Text } from 'react-native';
import THEME from '../styles/variables';

export default function AppText(props){
  const initialStyle = {
    fontFamily: props.bold ?
      THEME.appContentBoldFontFamily : THEME.appContentFontFamily
  };
  let styles = [];
  if(props.style){
    styles = Array.isArray(props.style) ? props.style : [props.style];
  }
  return <Text {...props} style={[initialStyle].concat(styles)} >
  {props.children}
  </Text>
}
