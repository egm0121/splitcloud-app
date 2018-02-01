import React, { PropTypes, Component } from 'react';
import { StyleSheet, View, Text,TouchableOpacity  } from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
export default function SelectionHeaderItem(props){
  return <View style={{flexDirection:'row'}}>
      <View style={styles.container}>
        <AppText bold={true} style={[styles.itemText,styles.titleText]} >
            {props.item.label}
        </AppText>
        <AppText style={styles.itemText} >
          {props.item.description}
        </AppText>
      </View>
  </View> ;
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:THEME.mainBgColor,
    paddingHorizontal:10,
    paddingVertical:10,
    borderBottomWidth:1,
    borderBottomColor:THEME.contentBorderColor
  },
  itemText : {
    color: THEME.mainColor,
    fontSize: 14,
    paddingRight:20
  },
  titleText:{
    color: THEME.mainHighlightColor,
    fontSize:18
  }
});
