/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  ListView,
  View,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import config from '../helpers/config';
import THEME from '../styles/variables'
import { connect } from 'react-redux';
import TrackListContainer from './trackListContainer';
import {
  pushNotification
} from '../redux/actions/notificationActions';
import {formatSidePlayerLabel,ucFirst} from '../helpers/formatters';
const {SC_CLIENT_ID} = config;
const SECTIONS = {
  UPLOADS:'uploads',
  FAVORITES:'favorites'
};
class OfflineTracksContainer extends Component {
  constructor(props){
    super(props);

    this.onRequestFail = this.onRequestFail.bind(this);
    this.onSectionChange = this.onSectionChange.bind(this);
  }
  componentWillMount(){

  }
  componentWillUnmount(){

  }
  componentWillReceiveProps(newProps){

  }
  componentDidUpdate(prevProps,prevState){

  }
  onRequestFail(err,type){
    this.props.pushNotification({
      type : 'error',
      message : 'Data Request Failed'
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <TrackListContainer {...this.props}
          side={this.props.side}
          trackList={this.state.trackList}
          onHeaderRender={() =>
            <View style={styles.headerContainer}>
              <View style={styles.horizontalContainer}>
                {!this.state.profileDetails ?
                  <ActivityIndicator animating={true} style={styles.loadingIndicator} /> :
                  <ArtistProfileHeader user={this.state.profileDetails} />
                }
                <View>
                  <SectionTabBar active={this.state.section} onSelected={this.onSectionChange}>
                    <SectionItem name={SECTIONS.UPLOADS} label={'Tracks'} />
                    <SectionItem name={SECTIONS.FAVORITES} label={'Favorites'}  />
                  </SectionTabBar>
                </View>
              </View>
            </View>}
        />
      </View>
    );
  }
}
OfflineTracksContainer
OfflineTracksContainer.propTypes = {
  side : PropTypes.string.isRequired
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingIndicator:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    height:100
  },
  headerContainer:{
    flexDirection:'row',
  },
  horizontalContainer:{
    flex:1,
    flexDirection:'column'
  }
});
const mapStateToProps = (state,props) => {
  const uploaderProfile =
    state.uploaderProfile.filter((profile) => profile.side == props.side).pop();
  return {
    scUploaderLink : uploaderProfile ? uploaderProfile.lastUploaderUrl :null
  };
}
const mapDispatchToProps = (dispatch,props) =>({
  pushNotification: (notification) => dispatch(pushNotification(notification))
});
const ConnectedOfflineTracksContainer = connect(mapStateToProps,mapDispatchToProps)(OfflineTracksContainer);

AppRegistry.registerComponent('OfflineTracksContainer', () => ConnectedOfflineTracksContainer);

export default ConnectedOfflineTracksContainer;
