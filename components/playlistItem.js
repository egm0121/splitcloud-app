import React, { PropTypes, Component } from 'react';
import { StyleSheet, View,Image,TouchableOpacity  } from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
import { formatDurationExtended, ucFirst } from '../helpers/formatters';

function getSmallArtworkUrl(url){
  if(!url)return;
  return url.replace('-large', '-t67x67');
}

export default function PlaylistItem(props){
  const rowTextStyle = [],
    artworkImage = {url:getSmallArtworkUrl(props.item.artwork)};
  
  const containerLayout = [styles.row,styles['row'+ucFirst(props.layout)]];
  return <View style={containerLayout}>
      <TouchableOpacity onPress={props.onSelected.bind(false,props.item)}>
        <View style={styles.rowArtworkContainer}>
          <Image style={styles.rowArtworkImage} source={artworkImage} resizeMode={'cover'}/>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.rowLabel} onPress={props.onSelected.bind(false,props.item)}>
          {props.item.username && props.item.label ?
          <View>
          <AppText bold={true} numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowTitleText].concat(rowTextStyle)} >
            {props.item.label}
          </AppText>
          <AppText bold={true} numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowAuthorText].concat(rowTextStyle)} >
            {props.item.username}
          </AppText>
          <AppText numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowDescText].concat(rowTextStyle)} >
            {props.onDescRender(props.item)}
          </AppText>
          </View>:
          <AppText bold={true} numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowTitleText,styles.singleLineTitle]} >
            {props.item.label}
          </AppText>
          }
      </TouchableOpacity>
  </View>;
}

PlaylistItem.defaultProps = {
  layout:'default',
  emptyLabel : 'No items :(',
  onDescRender: (item) => {
    const tracksCount = item.trackCount ? `${item.trackCount} songs` : '';
    const duration = `${formatDurationExtended(item.duration,{milli:true})}`;
    if(tracksCount){
      return `${tracksCount} • ${duration}`
    }
    if(item.duration){
      return `Duration ${duration}`;
    }
    return ''; 
  }
};
PlaylistItem.propTypes = {
  layout: PropTypes.string,
  item : PropTypes.object.isRequired,
  onSelected: PropTypes.func.isRequired,
  onDescRender: PropTypes.func
};
const styles = StyleSheet.create({
  itemText : {
    color: THEME.mainColor,
    fontSize: 14,
    paddingRight:20
  },
  rowHorizontal:{
    marginBottom:20,
    marginTop:20,
  },
  rowDefault:{
    marginBottom:15,
    marginTop:15,
  },
  row : {
    flex: 1,
    flexDirection:'row',
    paddingLeft: 20,
    paddingRight: 20
  },
  rowArtworkImage:{
    width:50,
    height:50,
    backgroundColor: THEME.listBorderColor,
    borderRadius:4
  },
  rowArtworkContainer:{
    width:60
  },
  rowLabel : {
    flex: 10,
    height: 50,
    borderColor: THEME.listBorderColor,
    borderBottomWidth:0
  },
  rowLabelText: {
    color: THEME.mainHighlightColor,
    lineHeight:18,
    fontSize: 15,
    fontWeight:'500'
  },
  rowTitleText:{
    color: THEME.mainHighlightColor,
    lineHeight:16,
    fontSize: 15
  },
  singleLineTitle:{
    lineHeight:35,
    fontSize:17
  },
  rowAuthorText:{
    color: THEME.mainHighlightColor,
    lineHeight:17,
    fontSize: 13
  },
  rowDescText :{
    color: THEME.mainColor,
    fontSize: 13,
    lineHeight:17
  },
  hightlightText : {
    color: THEME.mainActiveColor
  },
  rowAction : {
    flex: 2,
    paddingRight:20
  },
  rowActionText :{
    color: THEME.mainColor,
    opacity:0.8,
    fontSize: 45,
    fontWeight:'200',
    lineHeight:55,
    textAlign : 'right'
  }
});
