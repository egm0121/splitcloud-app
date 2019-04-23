import React, { PropTypes, Component } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native';
import THEME from '../styles/variables';
import { getArtworkImagePath , isLocalTrack} from '../helpers/formatters';
import AppText from './appText';

const ARTIST_TRACK_DELIMITER = ' - ';

function getSmallArtworkUrl(url){
  if(!url) return;
  return url.replace('-large','-large');
}
function isTrackLike(rowData){
  return rowData.id && rowData.label && !rowData.isEmpty
}
function cleanText(text){
  return text.replace(/(\"|\')/g,'').trim();
}
let isPressAndHold = false;
let initalPos;
let longPressRef;
export default function TrackItem(props){
  const rowData = props.item;
  const rowContainerStyle = [styles.row,props.style];
  const rowTextStyle = rowData.isEmpty ? [styles.placeholderRowText] : [];
  let trackAuthor,trackTitle,artworkImage;
  if(isTrackLike(rowData)){
    const parsedLabel = rowData.label.split(ARTIST_TRACK_DELIMITER);
    trackAuthor = cleanText(parsedLabel[0]);
    trackTitle = cleanText(parsedLabel.slice(1).join(ARTIST_TRACK_DELIMITER));
    if(!trackTitle){
      trackTitle = trackAuthor;
      trackAuthor = rowData.username;
    }
    artworkImage = isLocalTrack(rowData) ? 
     {url: getArtworkImagePath(rowData.artwork)}:
     {url: getSmallArtworkUrl(rowData.artwork)};

    if(props.currentTrack && rowData.id === props.currentTrack.id){
      rowTextStyle.push(styles.hightlightText);
    }
    if(props.currentPreviewTrack && rowData.id === props.currentPreviewTrack.id){
      rowContainerStyle.push(styles.rowContainerActive);
    }
  }

  const onLongPress = (e) => {
    isPressAndHold = true;
    props.onLongPressStart(rowData);
  };
  const onPressOut = (e) => {
    isPressAndHold = false;
    props.onLongPressEnd(rowData);
  };
  const onPress = (e) => { 
    if(isPressAndHold){
      return ;
    }
    props.onSelected(rowData);
  };
  return <View style={rowContainerStyle}>
   {!!props.renderArtwork &&
    <TouchableOpacity 
      onPress={onPress}
      onLongPress={onLongPress}
      onPressOut={onPressOut}
      >
      <View style={styles.rowArtworkContainer}>
        <Image style={styles.rowArtworkImage} source={artworkImage} resizeMode={'cover'}/>
      </View>
    </TouchableOpacity>
    }
    <TouchableOpacity style={styles.rowLabel} 
      onPress={onPress}
      onLongPress={onLongPress}
      onPressOut={onPressOut}
      delayLongPress={props.pressAndHoldDelay}
      >
        <AppText bold={true} numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowTitleText].concat(rowTextStyle)} >
          {trackTitle}
        </AppText>
        <AppText bold={true} numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowAuthorText].concat(rowTextStyle)} >
          {trackAuthor}
        </AppText>
        <AppText numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowDescText].concat(rowTextStyle)} >
          {props.onTrackDescRender(rowData)}
        </AppText>
    </TouchableOpacity>
    {!rowData.isEmpty && !props.hideAction ?
      <View style={[styles.rowAction, props.rowActionStyle]} >
        {props.onTrackActionRender(rowData)}
      </View>: null
      }
  </View>;
}

TrackItem.defaultProps = {
  layout:'default',
  onTrackActionRender : () => null,
  renderArtwork: true,
  style: null,
  pressAndHoldDelay: 450,
  onLongPressStart: () => {},
  onLongPressEnd: () => {},
};
TrackItem.propTypes = {
  layout: PropTypes.string,
  item : PropTypes.object.isRequired,
  currentTrack : PropTypes.object,
  currentPreviewTrack: PropTypes.object,
  onSelected: PropTypes.func.isRequired,
  onAction: PropTypes.func,
  onTrackDescRender: PropTypes.func.isRequired,
  onTrackActionRender: PropTypes.func.isRequired,
  onLongPressStart: PropTypes.func,
  onLongPressEnd: PropTypes.func,
};
const styles = StyleSheet.create({
  row : {
    flex: 1,
    flexDirection:'row',
    paddingBottom:10,
    paddingTop:10,
    paddingLeft: 20,
    paddingRight: 0,
  },
  rowContainerActive:{
    backgroundColor: THEME.listBorderColor
  },
  rowArtworkImage:{
    width:52,
    height:52,
    backgroundColor: THEME.listBorderColor,
    borderRadius:3
  },
  rowArtworkContainer:{
    width:60,
    paddingTop:5
  },
  rowLabel : {
    flex: 10,
    height: 62,
    borderColor: THEME.listBorderColor,
    borderBottomWidth:0
  },
  rowContainerPlaceholder:{
    flex: 1,
    flexDirection:'row',
    marginBottom:5,
    marginTop:5
  },
  rowPlaceholder :{
    flex : 1,
  },
  loadingIndicator:{
    paddingVertical:10
  },
  rowLabelText: {
    color: THEME.mainHighlightColor,
    lineHeight:20,
    fontSize: 15,
    fontWeight:'500'
  },
  rowTitleText:{
    color: THEME.mainHighlightColor,
    lineHeight:20,
    fontSize: 15
  },
  rowAuthorText:{
    color: THEME.mainHighlightColor,
    lineHeight:18,
    fontSize: 13
  },
  rowDescText :{
    color: THEME.mainColor,
    fontSize: 13,
    lineHeight:20
  },
  hightlightText : {
    color: THEME.mainActiveColor
  },
  placeholderRowText:{
    color:THEME.mainColor,
    lineHeight:30,
    textAlign:'center',
    fontSize: 17
  },
  rowAction : {
    flex: 2,
    paddingRight:20
  }
});