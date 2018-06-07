import React, {PropTypes, Component} from 'react';
import {
  StyleSheet,
  ListView,
  View
} from 'react-native';
import THEME from '../styles/variables';
import SelectionHeaderItem from './selectionHeaderItem';
import SelectionHorizontalListing from './selectionHorizontalListing';
import SoundcloudPlaylist from '../containers/soundcloudPlaylist';
class SelectionExplorer extends Component {

  constructor(props){
    super(props);
    this.renderRowWithData = this.renderRowWithData.bind(this);
    this.getSectionDataByUrn = this.getSectionDataByUrn.bind(this);
    this.onPlaylistSelected = this.onPlaylistSelected.bind(this);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    
    this.state = {
      pureList : [],
      renderList: this.ds.cloneWithRows([])
    };
  }
  componentWillMount(){
  }
  componentWillReceiveProps(newProps,newState){
    if( newProps.selectionList && 
        this.props.selectionList !== newProps.selectionList){
      this.updateList(newProps.selectionList);
    }
  }
  getSectionDataByUrn(urn){
    return this.state.pureList.find((curr)=> curr.urn == urn);
  }
  denormalizeDataList(listArr){
    return listArr;
  }
  updateList(listArr){
    const denormalizedData = this.denormalizeDataList(listArr);
    this.setState({
      pureList: listArr,
      renderList: this.ds.cloneWithRows(denormalizedData)
    });
  }
  onPlaylistSelected(playlist){
    this.props.navigator.push({
      title : 'SoundcloudPlaylist - '+ playlist.label + ' - ' + this.props.side,
      name : 'SoundcloudPlaylist' + this.props.side,
      component: SoundcloudPlaylist,
      passProps : {
        playlist: playlist,
        side : this.props.side,
        onClose: () => this.props.navigator.pop()
      }
    });
  }
  
  renderRowWithData(rowData) {
    if(!rowData)return null;
    return <View style={{flexDirection:'row'}} >
          <View style={{flexDirection:'column',flex:1}}>
            <SelectionHeaderItem item={rowData}/>
            <SelectionHorizontalListing items={rowData.playlists} onSelected={this.onPlaylistSelected}/>
        </View>
      </View>;
  }
  
  render(){
    return <View style={styles.container}>
      <ListView 
        contentContainerStyle={styles.list}
        dataSource={this.state.renderList}
        removeClippedSubviews={true}
        renderRow={this.renderRowWithData}
        />
    </View>
  }
}
SelectionExplorer.PropTypes = {
  'selectionList': PropTypes.array
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.contentBgColor
  },
  section:{

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
  rowLabel : {
    flex: 10,
    height: 72,
    borderColor: THEME.listBorderColor,
    borderBottomWidth:0
  },
  loadingIndicator:{
    paddingVertical:10
  },
  rowLabelText: {
    color: THEME.mainHighlightColor,
    lineHeight:20,
    fontSize: 15,
    fontWeight:'500'
  }
});
export default SelectionExplorer;