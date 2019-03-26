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
import ArtistProfileHeader from '../components/artistProfileHeader';
import BackButton from '../components/backButton';
import SoundCloudApi from '../modules/SoundcloudApi';
import HeaderBar from '../components/headerBar';
import SectionTabBar from '../components/sectionTabBar';
import SectionItem from '../components/sectionItem';
import TrackListContainer from './trackListContainer';
import {
  pushNotification
} from '../redux/actions/notificationActions';
import {
  addPlaylistItem
} from '../redux/actions/currentPlaylistActions';
import {formatSidePlayerLabel,ucFirst} from '../helpers/formatters';
const {SC_CLIENT_ID} = config;
const SECTIONS = {
  UPLOADS:'uploads',
  FAVORITES:'favorites',
  PLAYLISTS:'playlists'
};
class uploaderProfileContainer extends Component {
  constructor(props){
    super(props);
    console.log(
      'uploaderProfileContainer mounted with props',
      this.props.scUploaderLink,
      'side',this.props.side
    );
    this.state = {
      trackList : [],
      trackListLoading: false,
      section : SECTIONS.UPLOADS,
      profileDetails:false
    };
    this.sectionDataResolver = {
      [SECTIONS.UPLOADS]:'getScUserProfileTracks',
      [SECTIONS.FAVORITES]:'getScUserProfileFavorites',
      [SECTIONS.PLAYLISTS]:'getScUserPlaylists'
    }
    this.scApi = new SoundCloudApi({clientId: SC_CLIENT_ID});
    this.onRequestFail = this.onRequestFail.bind(this);
    this.onSectionChange = this.onSectionChange.bind(this);
  }
  updateTracks(url){
    this.setState({trackList:[],trackListLoading:true});
    let activeResolver = this.sectionDataResolver[this.state.section];
    this.fetchTrackList(activeResolver,url).then((tracks) =>{
      this.setState({trackList:tracks,trackListLoading:false});
    });
  }
  updateProfileDetails(url){
    this.setState({profileDetails:false});
    this.scApi.getScUserProfile(url).then((details) => {
      this.setState({profileDetails:details});
    });
  }
  componentWillMount(){
    this.updateProfileDetails(this.props.scUploaderLink);
    this.updateTracks(this.props.scUploaderLink);
  }
  componentWillUnmount(){
    this.prevQueryCancelToken.cancel();
  }
  componentWillReceiveProps(newProps){
    console.log('uploaderProfileContainer newProps',newProps.scUploaderLink);
    if(this.props.scUploaderLink != newProps.scUploaderLink){
      this.updateProfileDetails(newProps.scUploaderLink);
      this.updateTracks(newProps.scUploaderLink);
    }
  }
  componentDidUpdate(prevProps,prevState){
    if(prevState.section != this.state.section){
      console.log(prevState.section,this.state.section);
      this.updateTracks(this.props.scUploaderLink);
    }
  }
  generateRequestInvalidationToken(){
    this.prevQueryCancelToken = axios.CancelToken.source();
    return this.prevQueryCancelToken;
  }
  fetchTrackList(method,url){
    let requestPromise = this.scApi[method](
      url,
      { cancelToken : this.generateRequestInvalidationToken().token}
    );
    requestPromise
    .catch((err) => {
      console.log(err);
      this.onRequestFail(err);
      return Promise.resolve(err);
    });
    return requestPromise;
  }
  onRequestFail(err,type){
    this.props.pushNotification({
      type : 'error',
      message : 'Data Request Failed'
    });
  }
  onSectionChange(sectionName){
    this.setState({section:sectionName});
  }
  render() {
    return (
      <View style={styles.container}>
        <HeaderBar title={`${(formatSidePlayerLabel(this.props.side)).toUpperCase()} PLAYER`}>
          <BackButton style={styles.backButton} onPressed={this.props.onClose} />
        </HeaderBar>
        <TrackListContainer {...this.props}
          side={this.props.side}
          isLoading={this.state.trackListLoading}
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
                    <SectionItem name={SECTIONS.FAVORITES} label={'Favorites'} />
                    <SectionItem name={SECTIONS.PLAYLISTS} label={'Playlists'} />
                  </SectionTabBar>
                </View>
              </View>
            </View>}
        />
      </View>
    );
  }
}
uploaderProfileContainer.SECTIONS = SECTIONS;
uploaderProfileContainer.propTypes = {
  side : PropTypes.string.isRequired,
  scUploaderLink : PropTypes.string.isRequired,
  onClose : PropTypes.func.isRequired
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
  },
  backButton:{
    position:'absolute',
    left:0,
    paddingLeft:10,
    top:10,
    zIndex:20
  }
});
const mapStateToProps = (state,props) => {
  const uploaderProfile =
    state.uploaderProfile.filter((profile) => profile.side == props.side).pop();
  const lastUploaderUrl = uploaderProfile ? uploaderProfile.lastUploaderUrl : null;
  return {
    scUploaderLink : props.scUploaderLink || lastUploaderUrl
  };
}
const mapDispatchToProps = (dispatch,props) =>({
  pushNotification: (notification) => dispatch(pushNotification(notification))
});
const ConnecteduploaderProfileContainer = connect(mapStateToProps,mapDispatchToProps)(uploaderProfileContainer);

AppRegistry.registerComponent('uploaderProfileContainer', () => ConnecteduploaderProfileContainer);

export default ConnecteduploaderProfileContainer;
