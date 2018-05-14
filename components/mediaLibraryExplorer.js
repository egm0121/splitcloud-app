/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import THEME from '../styles/variables'
import MediaLibraryApi from '../modules/MediaLibraryApi';     
import SectionItem from './sectionItem';
import PlaylistContainer from '../containers/playlistContainer';
class MediaLibraryExplorer extends Component {
  constructor(props){
    super(props);
    console.log(
      'MediaLibraryExplorer mounted with props',this.props.side
    );
    console.log(this.props.onTrackAction)
    this.state = {
      trackList : [],
      sections : [
        {
          label:'All Music',
          name:'all'
        },
        {
          label:'Artists',
          name:'artists'
        },
        {
          label:'Albums',
          name:'albums'
        },
        
      ]
    };
    
    this.api = new MediaLibraryApi();
  }
  componentWillMount(){
    this.api.getAllTracks();
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
    }   
  }
  render() {
    return (
      <View style={styles.container}>
      {this.state.sections.map( (section,key) => {
        return <SectionItem name={section.name} label={section.label} key={key} onSelected={this.browseBy.bind(this,section.name)} />
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
  }
});

export default MediaLibraryExplorer;
