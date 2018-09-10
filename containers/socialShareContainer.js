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
  componentWillReceiveProps(newProps){
    const {interactionCount, didShareOnce, navigator} = this.props;
    if(interactionCount && (interactionCount % 20 == 0) && !didShareOnce){
      navigator.push({
        title : 'ShareAppScreen',
        name : 'ShareAppScreen',
        component: ShareAppScreen,
        passProps : {
          onClose:() => navigator.pop()
        }
      });
    }
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
