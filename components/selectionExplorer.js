import React, {PropTypes, Component} from 'react';
import {
  StyleSheet,
  ListView,
  View
} from 'react-native';
import THEME from '../styles/variables';
import SelectionHeaderItem from './selectionHeaderItem';
import PlaylistItem from './playlistItem';
import PlaylistContainer from '../containers/playlistContainer';
class SelectionExplorer extends Component {

  constructor(props){
    super(props);
    this.renderRowWithData = this.renderRowWithData.bind(this);
    this.renderSectionHeader = this.renderSectionHeader.bind(this);
    this.getSectionDataByUrn = this.getSectionDataByUrn.bind(this);
    this.onPlaylistSelected = this.onPlaylistSelected.bind(this);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.emptyResultRow = [{
      label:this.props.emptyLabel,
      isEmpty:true
    }];
    this.state = {
      pureList : [],
      renderList: this.ds.cloneWithRows(this.emptyResultRow)
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
  updateList(listArr){
    const denormalizedData = listArr.reduce((acc,selection) => {
      acc[selection.urn] = selection.playlists;
      return acc;
    },{});
    console.log('update selection list with',listArr,denormalizedData);
    this.setState({
      pureList: listArr,
      renderList: this.ds.cloneWithRowsAndSections(denormalizedData)
    });
  }
  onPlaylistSelected(playlist){
    this.props.navigator.push({
      title : 'PlaylistContainer - playlist.name - ' + this.props.side,
      name : 'PlaylistContainer' + this.props.side,
      component: PlaylistContainer,
      passProps : {
        playlist: playlist,
        side : this.props.side,
        onClose: () => this.props.navigator.pop()
      }
    });
  }
  renderRowWithData(rowData) {
    return <PlaylistItem item={rowData} onSelected={this.onPlaylistSelected} />;
  }
  renderSectionHeader(sectionData,sectionId) {
    let data = this.getSectionDataByUrn(sectionId);
    if(!data) return null;
    return <SelectionHeaderItem label={data.label} description={data.description} />;
  }
  render(){
    return <View style={styles.container}>
      <ListView 
        contentContainerStyle={styles.list}
        dataSource={this.state.renderList}
        removeClippedSubviews={false}
        renderRow={this.renderRowWithData}
        renderSectionHeader={this.renderSectionHeader}
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