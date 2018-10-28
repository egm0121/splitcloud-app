import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  LayoutAnimation
} from 'react-native';
import { connect } from 'react-redux';
import ShareAppScreen from '../components/shareAppScreen';


class SocialShareContainer extends Component {
  constructor(props){
    super(props);
  }
  componentDidUpdate(){
    this.checkInteractionCount();
  }
  checkInteractionCount(){
    const {interactionCount, didShareOnce} = this.props;
    if(interactionCount && (interactionCount % 15 == 0) && !didShareOnce){
      this.pushShareScreen();
    }
  } 
  pushShareScreen(){
    this.props.navigator.push({
      title : 'ShareAppScreen',
      name : 'ShareAppScreen',
      component: ShareAppScreen,
      passProps : {
        onClose:() => this.props.navigator.pop()
      }
    });
  }
  render() {
    return null;
  }
}

const mapStateToProps = (state, props) => {
  return {
    interactionCount: state.reviewState.actionCounter,
    didShareOnce: state.reviewState.shared
  };
}

const ConnectedSocialShareContainer = connect(mapStateToProps)(SocialShareContainer);

export default ConnectedSocialShareContainer;
