import React, {PropTypes, Component} from 'react';
import {
  StyleSheet,
  ListView,
  View
} from 'react-native';
import THEME from '../styles/variables';
import PlaylistItem from './playlistItem';
class SelectionHorizontalListing extends Component {

  constructor(props){
    super(props);
    this.renderRowWithData = this.renderRowWithData.bind(this);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    
    this.state = {
      pureList : props.items,
      renderList: this.ds.cloneWithRows(props.items)
    };
  }
  componentWillMount(){
  }
  componentWillReceiveProps(newProps,newState){

  }
  renderRowWithData(rowData) {
    if(!rowData)return null;
    return <PlaylistItem layout={'horizontal'} item={rowData} onSelected={this.props.onSelected} />;
  }
  render(){
    return <View style={styles.container}>
      <ListView 
        horizontal={true}
        initialListSize={4}
        pageSize={4}
        contentContainerStyle={styles.list}
        dataSource={this.state.renderList}
        removeClippedSubviews={false}
        renderRow={this.renderRowWithData}
      />
    </View>
  }
}
SelectionHorizontalListing.PropTypes = {
  'items': PropTypes.array
}
const styles = StyleSheet.create({
  container: {
    flexDirection:'row',
    flex: 1,
    backgroundColor: THEME.contentBgColor,
  }
});
export default SelectionHorizontalListing;
