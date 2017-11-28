/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  TextInput,
  ListView,
  View,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';

class TrackList extends Component {
  constructor(props){
    super(props);
    this.updateResultList = this.updateResultList.bind(this);
    this._onSongSelected = this._onSongSelected.bind(this);
    this._onSongAction = this._onSongAction.bind(this);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
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
  componentWillReceiveProps(newProps){
    if(this.props.tracksData != newProps.tracksData){
      this.updateResultList(newProps.tracksData);
    }
    if(this.props.currentPlayingTrack != newProps.tracksData){
      this.updateResultList([...newProps.tracksData]);
    }
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
  _onSongAction(rowData,){
    if(!rowData.isEmpty){
      this.props.onTrackAction(rowData,this.state.pureList);
    }
  }
  isTrack(rowData){
    return rowData.id && rowData.label && !rowData.isEmpty
  }
  getSmallArtworkUrl(url){
    if(!url)return;
    return url.replace('-large', '-t67x67');
  }
  renderRowWithData(rowData) {
    const rowTextStyle = rowData.isEmpty ? [styles.placeholderRowText] : [];
    let isTrack,trackAuthor,trackTitle,artworkImage;
    if(this.isTrack(rowData)){
      isTrack = true;
      [trackAuthor,trackTitle] = rowData.label.split('-').map((l) => l.trim());
      if(!trackTitle || trackTitle.length == 0){
        trackTitle = trackAuthor;
        trackAuthor = rowData.username;
      }
      artworkImage = {url:this.getSmallArtworkUrl(rowData.artwork)};
      if(rowData.id == this.props.currentTrack.id){
        rowTextStyle.push(styles.hightlightText);
      }
    }

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
    return (
      <View style={styles.row}>
        {this.props.renderArtwork &&
          <View style={styles.rowArtworkContainer}>
            <Image style={styles.rowArtworkImage} source={artworkImage} resizeMode={'cover'}/>
          </View>
          }
          <TouchableOpacity style={styles.rowLabel} onPress={this._onSongSelected.bind(this,rowData)}>
              <AppText bold={true} numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowTitleText].concat(rowTextStyle)} >
                {trackTitle}
              </AppText>
              <AppText bold={true} numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowAuthorText].concat(rowTextStyle)} >
                {trackAuthor}
              </AppText>
              <AppText numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowDescText].concat(rowTextStyle)} >
                {this.props.onTrackDescRender(rowData)}
              </AppText>
          </TouchableOpacity>
          {!rowData.isEmpty ?
            <TouchableOpacity style={styles.rowAction} onPress={this._onSongAction.bind(this,rowData)}>
              <Text style={[styles.rowActionText].concat((this.props.trackActionStyles || [] ))}>
                {this.props.onTrackActionRender(rowData)}
              </Text>
            </TouchableOpacity>: null
            }
      </View>
    );
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
          renderRow={this.renderRowWithData.bind(this)} ref={(ref) => this.props.listRef(ref)} />
      </View>
    );
  }
}

TrackList.defaultProps = {
  emptyLabel : 'No items :(',
  onTrackActionRender : () => '+',
  renderArtwork: true,
  isLoading: false,
  onEndThreshold: 150,
  listRef : () => {}
};
TrackList.propTypes = {
  tracksData : PropTypes.array.isRequired,
  emptyLabel : PropTypes.string,
  onTrackSelected: PropTypes.func,
  onTrackAction: PropTypes.func,
  onTrackActionRender: PropTypes.func,
  renderArtwork: PropTypes.bool,
  onHeaderRender: PropTypes.func,
  currentTrackId: PropTypes.number,
  isLoading: PropTypes.bool
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
  row : {
    flex: 1,
    flexDirection:'row',
    marginBottom:5,
    marginTop:5,
    paddingLeft: 20,
    paddingRight: 0
  },
  rowArtworkImage:{
    width:50,
    height:50,
    backgroundColor: THEME.listBorderColor
  },
  rowArtworkContainer:{
    width:60,
    paddingTop:5
  },
  rowLabel : {
    flex: 10,
    height: 72,
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
  },
  rowActionText :{
    color: THEME.mainColor,
    opacity:0.8,
    fontSize: 45,
    fontWeight:'200',
    lineHeight:55,
    textAlign : 'right'
  },
  footer : {
    borderColor : THEME.contentBorderColor,
    borderTopWidth :1,
    backgroundColor: THEME.mainBgColor
  },
  closeAction : {
    flex: 1,
    color: '#FFFFFF',
    fontWeight: '300',
    height: 40,
    padding: 10
  }
});


export default TrackList;
