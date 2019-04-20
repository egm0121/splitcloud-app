/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  StyleSheet,
  Text,
  Image,
  ListView,
  View,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
import PlaylistItem from './playlistItem';
import TrackItem from './trackItem';
import UserItem from './userItem';
const LIST_ITEM_HEIGHT = 82;

class TrackList extends Component {
  constructor(props){
    super(props);
    this.updateResultList = this.updateResultList.bind(this);
    this._onSongSelected = this._onSongSelected.bind(this);
    this.setListRef = this.setListRef.bind(this);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.listRef = null;
    this.timerRef = null;
    this.emptyResultRow = [{
      label:this.props.emptyLabel,
      isEmpty:true
    }];
    this.state = {
      pureList : [],
      renderList: this.ds.cloneWithRows(this.emptyResultRow)
    };
    console.log('onEndThreshold:',props.onEndThreshold);
  }
  componentWillMount(){
    this.updateResultList(this.props.tracksData);
  }
  componentDidMount(){
    if(this.props.tracksData && this.props.scrollToCurrentTrack ){
      setImmediate(() => {
        this.scrollToCurrentTrack(this.props.tracksData);
      });
    }
  }
  componentWillReceiveProps(newProps){
    if(this.props.tracksData != newProps.tracksData){
      this.updateResultList(newProps.tracksData);
      if( this.props.resetToTop ) {
        console.log('scroll to top');
        this.listRef.scrollTo({x:0, y:0, animated:true});
      }
    }
    if(this.props.currentTrack != newProps.currentTrack){
      this.updateResultList([...newProps.tracksData]);
    }
    if(this.props.currentPreviewTrack != newProps.currentPreviewTrack) {
      this.updateResultList([...newProps.tracksData]);
    }
  }
  setListRef(ref){
    this.listRef = ref;
    this.props.listRef(ref);
  }
  updateResultList(tracks){
    // in case of empty results or no search terms
    if(!tracks || !tracks.length){
      return this.setState({
        pureList : this.emptyResultRow,
        renderList : this.ds.cloneWithRows(this.emptyResultRow)
      });
    }
    this.setState({
      pureList : tracks,
      renderList : this.ds.cloneWithRows(tracks)
    })
  }
  _onSongSelected(rowData){
    if(!rowData.isEmpty){
      this.props.onTrackSelected(rowData,this.state.pureList);
    }
  }
  isTrack(rowData){
    return rowData.id && rowData.label && !rowData.isEmpty
  }
  scrollToCurrentTrack(trackList){
    const scrollPx = this.getCurrentTrackIndex(trackList) * LIST_ITEM_HEIGHT ;
    this.listRef.scrollTo({
      x: 0, 
      y: scrollPx,
      animated: true
    });
  }
  getCurrentTrackIndex(list){
    const { currentTrack } = this.props;
    return list.findIndex((track) => track.id === currentTrack.id); 
  }
  getSmallArtworkUrl(url){
    if(!url)return;
    return url.replace('-large', '-t67x67');
  }
  renderRowWithData(rowData) {
    if(rowData.isEmpty){
      return (
      <View style={[styles.rowContainerPlaceholder]}>
        <View style={styles.rowPlaceholder}>
          {this.props.isLoading ?
            <ActivityIndicator animating={true} style={styles.loadingIndicator}/> :
            <AppText bold={true} style={styles.placeholderRowText}>{rowData.label}</AppText>
          }
        </View>
      </View>
      );
    }
    if(rowData.type == 'playlist' && rowData.isArtist){
      return <UserItem user={rowData} onSelected={this._onSongSelected} />;
    }
    if(rowData.type == 'playlist'){
      return <PlaylistItem item={rowData} onSelected={this._onSongSelected} />;
    }
    return <TrackItem 
      item={rowData} 
      currentTrack={this.props.currentTrack}
      currentPreviewTrack={this.props.currentPreviewTrack}
      onSelected={this._onSongSelected} 
      onTrackActionRender={this.props.onTrackActionRender}
      onTrackDescRender={this.props.onTrackDescRender}
      onLongPressStart={this.props.onTrackPreviewStart}
      onLongPressEnd={this.props.onTrackPreviewEnd}
    />
  }
  render() {
    return (
      <View style={styles.container}>
        <ListView contentContainerStyle={styles.list}
          dataSource={this.state.renderList}
          removeClippedSubviews={false}
          renderHeader={this.props.onHeaderRender}
          onEndReached={this.props.onEndReached}
          onEndReachedThreshold={this.props.onEndThreshold}
          renderRow={this.renderRowWithData.bind(this)} ref={this.setListRef} />
      </View>
    );
  }
}

TrackList.defaultProps = {
  emptyLabel : 'No songs found...',
  isLoading: false,
  onEndThreshold: 150,
  listRef : () => {}
};
TrackList.propTypes = {
  tracksData : PropTypes.array.isRequired,
  emptyLabel : PropTypes.string,
  onTrackSelected: PropTypes.func,
  onTrackPreviewStart: PropTypes.func,
  onTrackPreviewEnd: PropTypes.func,
  onTrackActionRender: PropTypes.func,
  renderArtwork: PropTypes.bool,
  onHeaderRender: PropTypes.func,
  currentTrackId: PropTypes.number,
  isLoading: PropTypes.bool,
  resetToTop: PropTypes.bool,
  scrollToCurrentTrack: PropTypes.bool
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.contentBgColor
  },
  list:{
    alignItems: 'flex-start',
    backgroundColor: THEME.contentBgColor,
    flexDirection:'column'
  },
  rowContainerPlaceholder:{
    flex: 1,
    flexDirection:'row',
    marginBottom:5,
    marginTop:5
  },
  rowPlaceholder:{
    flex : 1,
  },
  loadingIndicator:{
    paddingVertical:10
  },
  placeholderRowText:{
    color:THEME.mainColor,
    lineHeight:30,
    textAlign:'center',
    fontSize: 17
  }
});


export default TrackList;
