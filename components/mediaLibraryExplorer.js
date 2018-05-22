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
          label:'All Music',
          name:'all'
        },
        {
          label:'Artists',
          name:'artist'
        },
        {
          label:'Albums',
          name:'album'
        },
      ]
    };
    
    this.api = new MediaLibraryApi();
  }
  componentWillMount(){
    this.api.getAllTracks();
    this.api.getAlbumList();
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
        title : 'MediaLibraryListing - '+sectionName+' - ' + this.props.side,
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
      {this.state.sections.map( (section,key) => {
        return <TouchableOpacity style={styles.rowContainer} key={key}>
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
    flex: 1,
    backgroundColor:THEME.mainBgColor
  },
  categoryContainer:{
    flex:1
  },
  arrowBtn:{
    flex:0,
    width:50
  },
  rowContainer:{
    paddingLeft:20,
    paddingVertical:20,
    flexDirection:'row',
  },
  sectionLabel:{
    fontSize:16
  }
});

export default MediaLibraryExplorer;
