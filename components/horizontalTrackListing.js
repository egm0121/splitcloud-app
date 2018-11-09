import TrackItem from './trackItem';
import React from 'react';
import {View, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import AppText from './appText';
import THEME from '../styles/variables';
import PlaylistContainer from '../containers/playlistContainer';


const styles = StyleSheet.create({
  container:{
    flexDirection:'column',
    paddingLeft:10,
    paddingVertical:10,
    borderBottomWidth:1,
    borderColor: THEME.contentBorderColor,
    backgroundColor: THEME.contentBorderColor
  },
  moreButton:{
    backgroundColor: THEME.contentBorderColor,
    borderColor: THEME.mainHighlightColor,
    width:70,
    height:70,
    borderRadius:35,
    borderWidth:1,
    alignItems:'center',
    justifyContent:'center',
    marginHorizontal:20
  },
  moreButtonText:{
    color: THEME.mainHighlightColor,
    fontSize: 12
  },
  titleText:{
    color: THEME.mainHighlightColor,
    fontSize: 18,
    marginVertical: 10
  }
});
function HorizontalTrackListing(props){
  let playlistSubset = props.items.slice(0,4);
  console.log('horizontalTrackListing render', playlistSubset,props);
  return <View style={styles.container}>
    <AppText bold={true} style={styles.titleText}>Suggested songs</AppText>
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      {playlistSubset.map((track,key) => 
      <TrackItem 
        style={{width:200}}
        key={key}
        item={track}
        currentTrack={props.currentTrack}
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
          tracks:props.items
        })}>
     <AppText style={styles.moreButtonText}>More...</AppText>
    </TouchableOpacity>: null}
    </ScrollView>
  </View>
}
export default HorizontalTrackListing;