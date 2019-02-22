import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import ShareAppScreen from '../components/shareAppScreen';
import { MAX_INTERACTION_COUNT } from '../helpers/constants';

let isInitialMount = true;

class SocialShareContainer extends Component {
  constructor(props){
    super(props);
  }
  componentDidMount(){
    const {interactionCount, didShareOnce} = this.props;
    if(interactionCount > MAX_INTERACTION_COUNT && !didShareOnce && isInitialMount) {
      console.log('socialShare container initial mount', interactionCount, didShareOnce);
      this.pushShareScreen();
    }
    isInitialMount = false;
  }
  componentDidUpdate(){
    this.checkInteractionCount();
  }
  checkInteractionCount(){
    const {interactionCount, didShareOnce} = this.props;
    if(interactionCount && interactionCount === MAX_INTERACTION_COUNT && !didShareOnce){
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
