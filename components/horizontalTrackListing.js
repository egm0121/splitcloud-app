import TrackItem from './trackItem';
import React from 'react';
import {View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import AppText from './appText';
import THEME from '../styles/variables';

const styles = StyleSheet.create({
  container:{
    flexDirection:'column',
    paddingLeft:10,
    paddingBottom:10,
    borderBottomWidth:1,
    borderColor: THEME.contentBorderColor,
    backgroundColor: THEME.contentBorderColor
  },
  moreButton:{
    backgroundColor: THEME.contentBorderColor,
    borderColor: THEME.mainHighlightColor,
    width:60,
    height:60,
    borderRadius:30,
    borderWidth:1,
    alignItems:'center',
    justifyContent:'center',
    marginTop:10,
    marginHorizontal:20
  },
  moreButtonText:{
    color: THEME.mainHighlightColor,
    fontSize: 12
  },
  titleText:{
    color: THEME.mainHighlightColor,
    fontSize: 16,
    marginTop:10
  }
});
function HorizontalTrackListing(props){
  let playlistSubset = props.items.slice(0,4);
  console.log('horizontalTrackListing render', playlistSubset,props);
  if(!playlistSubset.length) return null;
  return <View style={styles.container}>
    <AppText bold={true} style={styles.titleText}>{props.title}</AppText>
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      {playlistSubset.map((track,key) => 
      <TrackItem 
        style={{flex:0,width:200,marginBottom:0,marginTop:0,height:70}}
        hideAction={true}
        key={key}
        item={track}
        currentTrack={props.currentTrack}
        currentPreviewTrack={props.currentPreviewTrack}
        onLongPressStart={props.onTrackPreviewStart}
        onLongPressEnd={props.onTrackPreviewEnd}
        onSelected={(item) => {
          props.onSelected(item,props.items);
        }} 
        onTrackDescRender={props.onTrackDescRender} 
        onTrackActionRender={() =>{}} />
    )}
    {playlistSubset.length ? <TouchableOpacity style={styles.moreButton} 
      onPress={
        ()=> props.onPlaylistSelected({
          label: `Suggested for: ${props.currentTrack.label}`,
          tracks: props.items
        })}>
     <AppText style={styles.moreButtonText}>More...</AppText>
    </TouchableOpacity>: null}
    </ScrollView>
  </View>
}
HorizontalTrackListing.defaultProps = {
  title: 'Suggested songs'
}
export default HorizontalTrackListing;