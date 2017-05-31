/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  ListView,
  View,
  TouchableOpacity
} from 'react-native';
import THEME from '../styles/variables';

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
  }
  componentWillMount(){
    this.updateResultList(this.props.tracksData);
  }
  componentWillReceiveProps(newProps){
    if(this.props.tracksData != newProps.tracksData){
      this.updateResultList(newProps.tracksData);
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
      this.props.onTrackSelected(rowData);
    }
  }
  _onSongAction(rowData,){
    if(!rowData.isEmpty){
      this.props.onTrackAction(rowData);
    }
  }

  renderRowWithData(rowData) {
    const rowTextStyle = rowData.isEmpty ? [styles.placeholderRowText] : [];
    if( this.props.highlightProp && rowData[this.props.highlightProp] ){
      rowTextStyle.push(styles.hightlightText);
    }
    if(rowData.isEmpty){
      return (
      <View style={[styles.rowContainerPlaceholder]}>
        <View style={styles.rowPlaceholder}>
          <Text style={styles.placeholderRowText}>{rowData.label}</Text>
        </View>
      </View>
      );
    }
    return (
      <View style={styles.row}>
          <TouchableOpacity style={styles.rowLabel} onPress={this._onSongSelected.bind(this,rowData)}>
            <Text numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowLabelText].concat(rowTextStyle)} >{rowData.label} </Text>
            <Text numberOfLines={1} ellipsizeMode={'tail'} style={[styles.rowDescText].concat(rowTextStyle)} >{rowData.username} </Text>
          </TouchableOpacity>
        <View style={styles.rowAction}>
          <TouchableOpacity onPress={this._onSongAction.bind(this,rowData)}>
            {rowData.isEmpty ? null : <Text style={styles.rowActionText}>{this.props.onTrackActionRender(rowData)}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <ListView contentContainerStyle={styles.list}
          dataSource={this.state.renderList}
          removeClippedSubviews={false}
          renderRow={this.renderRowWithData.bind(this)} />
        <View style={styles.footer}>
          <TouchableOpacity onPress={this.props.onClose}>
            <Text style={styles.closeAction}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

TrackList.defaultProps = {
  emptyLabel : 'Empty Tracklist',
  onTrackActionRender : () => '+'
};
TrackList.propTypes = {
  tracksData : PropTypes.array.isRequired,
  emptyLabel : PropTypes.string,
  onTrackSelected: PropTypes.func,
  onTrackAction: PropTypes.func,
  onTrackActionRender: PropTypes.func,
  highlightProp : PropTypes.string,
  onClose: PropTypes.func
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
    paddingRight: 20
  },
  rowLabel : {
    flex: 10,
    height: 52,
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
  rowLabelText: {
    color: THEME.mainHighlightColor,
    lineHeight:20,
    fontSize: 15,
    fontWeight:'600'
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
    borderColor: THEME.listBorderColor,
    borderBottomWidth:0
  },
  rowActionText :{
    color: THEME.mainColor,
    opacity:0.8,
    fontSize: 35,
    lineHeight:37,
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
    fontWeight: 'bold',
    height: 40,
    padding: 10
  }
});


export default TrackList;
