/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import axios from 'axios';
import THEME from '../styles/variables'
import MediaLibraryApi from '../modules/MediaLibraryApi';
import TrackListContainer from '../containers/trackListContainer';

class MediaLibraryExplorer extends Component {
  constructor(props){
    super(props);
    console.log(
      'MediaLibraryExplorer mounted with props',this.props.side
    );
    console.log(this.props.onTrackAction)
    this.updateResultList = this.updateResultList.bind(this);
    this.state = {
      trackList : []
    };
    
    this.api = new MediaLibraryApi();
  }
  componentWillMount(){
    this.loadTracks().then(this.updateResultList).catch((err) =>{
      console.error(err)
    });
  }
  componentWillUnmount(){
  }
  loadTracks(){
    return this.api.getAllTracks();
  }
  updateResultList(tracks){
    console.log('media library trackList',tracks);
    // in case of empty results or no search terms
    if(!tracks){
      return this.setState({ trackList : [] });
    }
    this.setState({ trackList : tracks });

  }
  render() {
    return (
      <View style={styles.container}>
        <TrackListContainer
          side={this.props.side}
          trackList={this.state.trackList}
        />
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
  backButton:{
    position:'absolute',
    left:0,
    paddingLeft:10,
    top:20,
    zIndex:20
  }
});

export default MediaLibraryExplorer;
