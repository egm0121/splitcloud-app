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
  ActivityIndicator,
  View,
  TouchableOpacity,
  TouchableHighlight,
  LayoutAnimation
} from 'react-native';
import THEME from '../styles/variables';
import {animationPresets} from '../helpers/constants';
import { ucFirst } from '../helpers/formatters';
import TrackList from '../components/trackList';
import {formatDuration, formatGenreLabel} from '../helpers/formatters';
class UploaderProfile extends Component {

  constructor(props){
    super(props);

  }
  componentWillMount(){

  }
  invalidatePrevRequest(){
    if(this.prevQueryCancelToken){
      this.prevQueryCancelToken.cancel({aborted:true});
    }
  }
  onTrackDescRender(rowData){
    return rowData.duration ?
      `${formatDuration(rowData.duration,{milli:true})} • ${rowData.username}` :
      rowData.username ;
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.listDescription} >
          <View style={styles.descContainer}>
            <Text style={styles.listDescriptionText}>Tracks by {this.props.scUploader}</Text>
          </View>
        </View>
        <TrackList
          listRef={(ref) => this.trackListRef = ref}
          tracksData={this.props.tracksData}
          onTrackDescRender={this.onTrackDescRender}
          onTrackActionRender={(rowData) => rowData.isCurrentTrack ? null : '+'}
          highlightProp={'isCurrentTrack'}
          onTrackAction={this.props.onSongQueued}
          onTrackSelected={this.props.onSongSelected}
          {...this.props}
          />
      </View>
    );
  }

}
UploaderProfile.defaultProps = {
  onRequestFail(){}
};
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  descContainer :{
    flex: 1
  },
  listDescription : {
    backgroundColor: THEME.contentBgColor,
    paddingLeft:10,
    borderBottomWidth:1,
    borderColor: THEME.contentBorderColor,
    justifyContent:'space-between',
    flexDirection:'row'
  },
  listDescriptionText :{
    fontSize : 18,
    paddingVertical:10,
    fontWeight:'600',
    color: THEME.mainHighlightColor
  },
  listDetailText :{
    fontSize : 16,
    textAlign: 'center',
    color: THEME.mainColor
  }
});

UploaderProfile.propTypes = {
  tracksData: PropTypes.array.isRequired,
  onSongSelected: PropTypes.func.isRequired,
  onSongQueued: PropTypes.func,
  onChartLoadingError :PropTypes.func,
  onClose: PropTypes.func
};

export default UploaderProfile;
