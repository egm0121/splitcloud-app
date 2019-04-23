import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import ShareAppScreen from '../components/shareAppScreen';
import { MAX_INTERACTION_COUNT, MAX_DAILY_INTERACTION_COUNT } from '../helpers/constants';

let isInitialMount = true;

class SocialShareContainer extends Component {
  constructor(props){
    super(props);
  }
  componentDidMount(){
    const {interactionCount, didShareOnce, dailyInteractionCount} = this.props;
    if(interactionCount > MAX_INTERACTION_COUNT && !didShareOnce && isInitialMount) {
      console.log('socialShare container initial mount', interactionCount, didShareOnce);
      this.pushShareScreen();
    }
    console.log('SocialShareContainer did mount',{dailyInteractionCount,MAX_DAILY_INTERACTION_COUNT, isInitialMount})
    if(dailyInteractionCount >=  MAX_DAILY_INTERACTION_COUNT && isInitialMount){
      this.pushShareScreen({rewardedOnly: true});
    }
    isInitialMount = false;
  }
  componentDidUpdate(prevProps){
    const {interactionCount, didShareOnce, dailyInteractionCount} = this.props;
    if( prevProps.interactionCount !== interactionCount || 
        prevProps.didShareOnce !== didShareOnce ||
        prevProps.dailyInteractionCount !== dailyInteractionCount
      ){
        console.log('action counter props updated',{
          interactionCount,
          didShareOnce,
          dailyInteractionCount
        });
        this.checkInteractionCount();
      }
  }
  checkInteractionCount(){
    const {interactionCount, didShareOnce, dailyInteractionCount } = this.props;
    if(interactionCount && interactionCount >= MAX_INTERACTION_COUNT && !didShareOnce){
      this.pushShareScreen();
    }
    if(dailyInteractionCount >= MAX_DAILY_INTERACTION_COUNT){
      this.pushShareScreen({rewardedOnly: true});
    }
  } 
  pushShareScreen(props = {}){
    this.props.navigator.push({
      title : 'ShareAppScreen',
      name : 'ShareAppScreen',
      component: ShareAppScreen,
      passProps : {
        onClose:() => this.props.navigator.pop(),
        ...props,
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
    dailyInteractionCount: state.reviewState.dailyActionCounter,
    didShareOnce: state.reviewState.shared
  };
}

const ConnectedSocialShareContainer = connect(mapStateToProps)(SocialShareContainer);

export default ConnectedSocialShareContainer;
