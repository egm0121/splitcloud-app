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
import SoundCloudApi from '../modules/SoundcloudApi';
import UserList from '../components/userList';
import throttle from 'lodash.throttle';
import {
  pushNotification
} from '../redux/actions/notificationActions';

const {SC_CLIENT_ID} = config;
class UserFinderContainer extends Component {
  constructor(props){
    super(props);
    console.log('userFinderContainer mounted with props');
    this.state = {
      userList:[]
    };
    this.scApi = new SoundCloudApi({clientId: SC_CLIENT_ID});
    this.onRequestFail = this.onRequestFail.bind(this);
    this.searchUsers = throttle(
      this.searchUsers.bind(this),
      this.props.debounceWait
    );
  }
  searchUsers(terms){
    if(this.prevQueryCancelToken){
      this.prevQueryCancelToken.cancel({aborted:true});
    }
    return this.scApi.searchUsers(terms,5,0,{
      cancelToken:this.generateRequestInvalidationToken().token
    });
  }
  componentWillMount(){
    console.log('userFinderContainer props');
    this.searchUsers(this.props.terms).then((users) => {
      this.setState({userList:users});
    }).catch(err => console.log('user search failed - onmount',err));
  }
  componentWillUnmount(){
    this.prevQueryCancelToken.cancel();
  }
  componentWillReceiveProps(newProps){
    if(this.props.terms != newProps.terms){
      this.searchUsers(this.props.terms).then((users) => {
        this.setState({userList:users});
      }).catch(err => console.log('user search failed',err));
    }
  }
  generateRequestInvalidationToken(){
    this.prevQueryCancelToken = axios.CancelToken.source();
    return this.prevQueryCancelToken;
  }
  onRequestFail(err,type){
    this.props.pushNotification({
      type : 'error',
      message : 'Data Request Failed'
    });
  }
  render() {
    return <UserList {...this.props}
      userList={this.state.userList}
      onUserSelected={this.props.onUserSelected}
    />;
  }
}
UserFinderContainer.defaultProps = {
  debounceWait: 100
};
UserFinderContainer.propTypes = {
  side : PropTypes.string.isRequired,
  terms : PropTypes.string.isRequired,
  debounceWait: PropTypes.number
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
const mapStateToProps = (state,props) => {
  const uploaderProfile =
    state.uploaderProfile.filter((profile) => profile.side == props.side).pop();
  return {
    uploaderProfile
  };
}
const mapDispatchToProps = (dispatch,props) =>({
  pushNotification: (notification) => dispatch(pushNotification(notification)),
  onUserSelected: (user) => console.log('selected user',user)
});
const ConnectedUserFinderContainer = connect(mapStateToProps,mapDispatchToProps)(UserFinderContainer);

AppRegistry.registerComponent('UserFinderContainer', () => ConnectedUserFinderContainer);

export default ConnectedUserFinderContainer;
