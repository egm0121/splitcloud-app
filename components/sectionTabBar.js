import React, { PropTypes, Component } from 'react';
import { StyleSheet, View } from 'react-native';
import THEME from '../styles/variables';

export default function SectionTabBar(props){
  return <View style={styles.tabBarContainer}>
  { React.Children.map( props.children, function(child){
    if(React.isValidElement(child)){
      return React.cloneElement(child, {
        onSelected: props.onSelected,
        active:props.active
      });
    }
    return child;
  })}
  </View>;
}

const styles = StyleSheet.create({
  tabBarContainer:{
    flexDirection:'row',
    paddingHorizontal:20,
    paddingVertical:20,
    borderBottomWidth:1,
    //backgroundColor:THEME.contentBorderColor,
    borderColor: THEME.contentBorderColor
  }
});
