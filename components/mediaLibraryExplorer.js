/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
import THEME from '../styles/variables'
import MediaLibraryApi from '../modules/MediaLibraryApi';     
import SectionItem from './sectionItem';
import PlaylistContainer from '../containers/playlistContainer';
import MediaLibraryListing from './mediaLibraryListing';
import Button from './button';
import AppText from './appText';

class MediaLibraryExplorer extends Component {
  constructor(props){
    super(props);
    console.log(
      'MediaLibraryExplorer mounted with props',this.props.side
    );
    this.state = {
      trackList : [],
      sections : [
        {
          label:'All Local Music',
          name:'all'
        },
        {
          label:'All Artists',
          name:'artist'
        },
        {
          label:'All Albums',
          name:'album'
        },
      ]
    };
    
    this.api = new MediaLibraryApi();
  }
  componentWillMount(){
    this.api.getAllTracks();
    this.api.getAlbumList();
    console.log('start caching album artwork');
    this.api.cacheLibraryArtworks().then(results => {
      console.log('all artwork cached to file nbr:',results.length,'images:',results);
    },(err) => console.log('err',err));
  }
  loadTracks(){
    return this.api.getAllTracks();
  }
  browseBy(sectionName){
    if(sectionName == 'all'){
      this.api.getAllPlaylist().then(playlist => {
        this.props.navigator.push({
          title : 'PlaylistContainer - '+playlist.label+' - ' + this.props.side,
          name : 'PlaylistContainer' + this.props.side,
          component: PlaylistContainer,
          passProps : {
            playlist,
            side : this.props.side,
            onClose: () => this.props.navigator.pop()
          }
        });
      });      
    } else {
      this.props.navigator.push({
        title : 'MediaLibraryListing - ' + sectionName + ' - ' + this.props.side,
        name : 'MediaLibraryListing' + this.props.side,
        component: MediaLibraryListing,
        passProps : {
          browseCategory: sectionName,
          side : this.props.side,
          onClose: () => this.props.navigator.pop()
        }
      })
    }   
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.headingContainer]}>
          <AppText bold={true} style={[styles.heading]}>Local Music Library</AppText>
        </View>
      {this.state.sections.map( (section,key) => {
        return <TouchableOpacity style={styles.rowContainer} 
          onSelected={this.browseBy.bind(this,section.name)} key={key}>
          <SectionItem onSelected={this.browseBy.bind(this,section.name)} 
            forceActive={true} name={section.name} 
            style={styles.categoryContainer} 
            textStyle={styles.sectionLabel} 
            label={section.label}  />
          <Button style={styles.arrowBtn} 
            image={require('../assets/flat_fwd_arrow.png')} size={'tiny'} 
            onPressed={this.browseBy.bind(this,section.name)} />
          </TouchableOpacity>
      })}
        <View style={[styles.headingContainer]}>
          <AppText bold={true} style={[styles.heading]}>Saved from Splitcloud</AppText>
        </View>
      </View>
    );
  }
}
MediaLibraryExplorer.propTypes = {
  side : PropTypes.string.isRequired,
  onClose : PropTypes.func.isRequired
}
const styles = StyleSheet.create({
  container: {
    flexDirection:'column',
    flex: 1,
    
  },
  categoryContainer:{
    flex:1,
  },
  arrowBtn:{
    flex:0,
    width:30
  },
  rowContainer:{
    paddingLeft:20,
    paddingVertical:20,
    flexDirection:'row',
  },
  sectionLabel:{
    fontSize:16
  },
  headingContainer:{
    backgroundColor:THEME.mainBgColor,
    paddingLeft:10,
    paddingVertical:20,
    borderBottomWidth:1,
    borderBottomColor:THEME.contentBorderColor
  },
  heading:{
    color: THEME.mainHighlightColor,
    fontSize: 18,
  }
});

export default MediaLibraryExplorer;
