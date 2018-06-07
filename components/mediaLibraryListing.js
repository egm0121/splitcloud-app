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
import TrackListContainer from '../containers/trackListContainer';
import HeaderBar from './headerBar';
import BackButton from './backButton';
import MediaLibraryPlaylist from '../containers/mediaLibraryPlaylist';
import { ucFirst } from '../helpers/formatters';

class MediaLibraryListing extends Component {
  constructor(props){
    super(props);
    console.log(
      'MediaLibraryListing mounted with props',this.props.side
    );
    this.updateResultList = this.updateResultList.bind(this);
    this.onPlaylistSelected = this.onPlaylistSelected.bind(this);
    this.state = {
      data : {}
    };
    this.browseMap ={
      'album':'getAlbumList',
      'artist':'getArtistList'
    };
    this.playlistMap ={
      'album':'getAlbum',
      'artist':'getArtist'
    };
    this.api = new MediaLibraryApi();
  }
  componentDidMount(){
    this.getList()
      .then(this.updateResultList)
      .catch((err) =>{
        console.error(err)
      });
  }
  componentWillUnmount(){
  }
  getList(){
    const methodName = this.browseMap[this.props.browseCategory];
    return this.api[methodName]();
  }
  updateResultList(list){
    console.log('media library trackList',list);
    // in case of empty results or no search terms
    if(!list){
      return this.setState({ data : [] });
    }
    this.setState({ data : list });
  }
  onPlaylistSelected(playlist){
    const fetchMethod = this.playlistMap[this.props.browseCategory];
    this.api[fetchMethod](playlist.label).then(playlist => {
      this.props.navigator.push({
        title : 'MediaLibraryPlaylist - '+playlist.label+' - ' + this.props.side,
        name : 'MediaLibraryPlaylist' + this.props.side,
        component: MediaLibraryPlaylist,
        passProps : {
          playlist: playlist,
          browseCategory: this.props.browseCategory,
          side : this.props.side,
          onClose: () => this.props.navigator.pop()
        }
      });
    })
    
  }
  render() {
    return (
      <View style={styles.container}>
        <HeaderBar title={`${ucFirst(this.props.browseCategory)}s`}>
          <BackButton onPressed={this.props.onClose} style={styles.closeButton}/>
        </HeaderBar>
        <TrackListContainer
          side={this.props.side}
          trackList={this.state.data}
          onPlaylistSelected={this.onPlaylistSelected}
        />
      </View>
    );
  }
}
MediaLibraryApi.defaultProps = {
  browseCategory : 'album'
}
MediaLibraryListing.propTypes = {
  side : PropTypes.string.isRequired,
  browseCategory : PropTypes.oneOf(['album','artist']),
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:THEME.mainBgColor
  },
  closeButton :{
    position:'absolute',
    left:0,
    paddingLeft:10,
    top:10
  }
});

export default MediaLibraryListing;