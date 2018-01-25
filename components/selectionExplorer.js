import React, {PropTypes, Component} from 'react';
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

class SelectionExplorer extends Component {

  constructor(props){
    super(props);
    this.renderRowWithData = this.renderRowWithData.bind(this);
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
    this.updateList(this.props.selectionList);
  }
  componentWillReceiveProps(newProps,newState){
    if( newProps.selectionList && 
        this.props.selectionList !== newProps.selectionList){
      this.updateList(newProps.selectionList);
    }
  }
  updateList(listArr){
    this.setState({
      pureList: listArr,
      renderList: this.ds.cloneWithRowsAndSections(listArr,['urn'])
    });
  }
  renderRowWithData(rowData) {
    return <View>
      <AppText bold={true} numberOfLines={1}
         ellipsizeMode={'tail'} style={styles.rowLabelText}>
        {rowData.label}
      </AppText>
    </View>;
  }
  render(){
    return <View style={styles.container}>
      <ListView 
        contentContainerStyle={styles.list}
        dataSource={this.state.renderList}
        removeClippedSubviews={false}
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