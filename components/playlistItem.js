import React, { PropTypes, Component } from 'react';
import { StyleSheet, View,Image,TouchableOpacity  } from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
import { formatDurationExtended, ucFirst } from '../helpers/formatters';

function getSmallArtworkUrl(url,layout){
  if(!url)return;
  if(layout == 'horizontal'){
    return url.replace('-large','-t300x300');
  }
  return url.replace('-large', '-t67x67');
}

export default function PlaylistItem(props){
  const rowTextStyle = [styles['rowText'+ucFirst(props.layout)]],
    artworkImage = {url: getSmallArtworkUrl(props.item.artwork, props.layout)},
    isHorizontal = props.layout == 'horizontal';
  
  const containerLayout = [styles.row,styles['row'+ucFirst(props.layout)]];
  return <View style={containerLayout}>
      <TouchableOpacity onPress={props.onSelected.bind(false,props.item)}>
        <View style={[styles.rowArtworkContainer, styles['rowArtworkContainer'+ucFirst(props.layout)]]}>
          <Image style={[styles.rowArtworkImage, styles['rowArtwork'+ucFirst(props.layout)]]} source={artworkImage} resizeMode={'cover'}/>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.rowLabel,styles['rowLabel'+ucFirst(props.layout)]]} onPress={props.onSelected.bind(false,props.item)}>
          {!!props.item.username && props.item.label ?
          <View>
          <AppText bold={true} numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowTitleText,styles['rowLabelText'+ucFirst(props.layout)]].concat(rowTextStyle)} >
            {props.item.label}
          </AppText>
          <AppText bold={true} numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowAuthorText,styles['rowAuthorText'+ucFirst(props.layout)]].concat(rowTextStyle)} >
            {props.item.username}
          </AppText>
          {!isHorizontal && <AppText numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowDescText].concat(rowTextStyle)} >
            {props.onDescRender(props.item,props)}
          </AppText>}
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
  onDescRender: (item,props) => {
    const tracksCount = item.trackCount ? `${item.trackCount} songs` : '';
    const duration = `${formatDurationExtended(item.duration,{milli:true})}`;
    if(props.layout == 'horizontal'){
      return tracksCount;
    }
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
    marginBottom:15,
    marginTop:15,
    flex:0,
    flexDirection:'column',
    width:130,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: THEME.mainBgColor,
    // borderBottomWidth:1,
    // borderBottomColor: THEME.listBorderColor,
    borderRadius: 2,
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
  rowArtworkHorizontal:{
    width:80,
    height:80,
    borderRadius:6
  },
  rowArtworkContainer:{
    width:60
  },
  rowArtworkContainerHorizontal:{
    width:110,
    paddingHorizontal:20,
    paddingBottom:10,
    alignItems:'center',
  },
  rowLabelHorizontal:{
    height: 35,
  },
  rowTextHorizontal:{
    textAlign:'center'
  },
  rowLabelTextHorizontal:{
    lineHeight:17,
    fontSize: 14,
    fontWeight:'700'
  },
  rowAuthorTextHorizontal:{
    lineHeight:17,
    fontSize: 13,
    fontWeight:'500'
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
