import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  NetInfo
} from 'react-native';
let networkStateCache = {
  isOnline : false,
  connectionInfo : null
};
class NetworkAvailability extends Component{
  constructor(props){
    super(props);
    this.state = networkStateCache;
    this.updateNetworkState = this.updateNetworkState.bind(this);
  }
  componentWillMount(){
    NetInfo.fetch().then((connectionInfo) => {
      this.updateNetworkState(connectionInfo);
    });
    NetInfo.addEventListener(
      'change',
      this.updateNetworkState
    );
  }
  componentWillUnmount() {
    NetInfo.removeEventListener(
      'change',
      this.updateNetworkState
    );
  }
  updateNetworkState(connType){
    this.setState({
      isOnline: connType != 'none',
      connectionInfo: connType
    },() => networkStateCache = this.state);
    
  }
  render(){
    return this.props.children(this.state.isOnline,this.state.connectionInfo);
  }
}
NetworkAvailability.propTypes = {

};
export default NetworkAvailability;
