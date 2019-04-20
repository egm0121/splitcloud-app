/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  StyleSheet,
  Clipboard,
  View,
  Image,
  Linking,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { connect } from 'react-redux';
import THEME from '../styles/variables'
import BackButton from '../components/backButton';
import HeaderBar from '../components/headerBar';
import Button from '../components/button';
import AppText from '../components/appText';
import Share from 'react-native-share';
import { MAX_INTERACTION_COUNT, MAX_DAILY_INTERACTION_COUNT } from '../helpers/constants';
import config from '../helpers/config';
import {
  pushNotification
} from '../redux/actions/notificationActions';
import {
  completedSocialShareAction,
  abortedSocialShareAction,
  socialShareRequiredAction,
  rewarededAdCompletedAction,
  playRewardedAdAction,
  rewardedAdAbortedAction,
} from '../redux/actions/storeReviewAction';
import {
  pauseCurrentTrack
} from '../redux/actions/playbackStatusActions';
import {
  AdMobRewarded,
} from 'react-native-admob';

class ShareAppScreen extends Component {
  constructor(props){
    super(props);
    this.rewardedAd = null;
    this.didApplyReward = false;
    this.state = {
      didRewardAdLoad: false
    }
    this.loadAttempts = 0;
    this.closeScreen = this.closeScreen.bind(this);
    this.onRewardedAdSelected = this.onRewardedAdSelected.bind(this);
  }
  componentDidMount(){
    if (this.props.isAppLocked) {
      console.log('pauseAllPlayback');
      this.props.pauseAllPlayback();
      this.setupRewardedAdUnit();
      this.preloadRewardedAd();
    }
  }
  closeScreen(){
    setTimeout(() => this.props.onClose(),1e3);
  }
  setupRewardedAdUnit(){
    AdMobRewarded.setAdUnitID(config.ADMOB_REWARDED_ID);
    AdMobRewarded.setTestDevices([AdMobRewarded.simulatorId]);
  }
  preloadRewardedAd(){
    this.rewardedAd = AdMobRewarded.requestAd();
    this.rewardedAd
    .then(() => {
      this.setState({didRewardAdLoad:true});
      this.loadAttempts = 0;
    })
    .catch(err => { 
      console.log('rewarded ad load failed',err);
      this.loadAttempts++;
      if(this.loadAttempts < 3) {
        console.log('rewarded ad retry',this.loadAttempts);
        this.preloadRewardedAd();
      } else {
        this.props.abortAdReward();
        this.closeScreen();
      }
    });
  }
  onRewardedAdSelected(){
    console.log('show rewarded ad');
    if(!this.state.didRewardAdLoad) return;
    const  { applyAdReward , playRewardedAd } = this.props;
    playRewardedAd();
    AdMobRewarded.addEventListener('rewarded',() => {
      console.log('video ad done, user rewarded');
      applyAdReward();
      this.didApplyReward = true;
    });
    AdMobRewarded.addEventListener('adClosed',() => {
      console.log('video ad closed');
      if(this.didApplyReward){
        this.closeScreen();
      }
    });
    this.rewardedAd.then(() => AdMobRewarded.showAd());
  }
  openShareApp(platformName){
    const { shareOptions } = this.props;
    if(platformName == 'line') {
      const bodyURI = encodeURIComponent(`${shareOptions.message} ${shareOptions.url}`);
      Linking.openURL(`line://msg/text/?${bodyURI}`)
      .then(() => this.props.onSocialShareCompleted(platformName))
      .catch(() => this.props.onSocialShareAborted())
    }
    if(platformName == 'clipboard') {
      Clipboard.setString(shareOptions.url);
      this.props.onPushNotification('Link Copied');
      this.props.onSocialShareCompleted(platformName);
      this.closeScreen();
      return true;
    }
    return Share.shareSingle({...shareOptions, social: platformName})
    .then(data => {
      console.log('social share completed');
      this.props.onSocialShareCompleted(platformName);
      this.closeScreen();
    }).catch(err => {
      console.log('social share failed',err);
      this.props.onSocialShareAborted(platformName);
    });
  }
  componentDidUpdate(){
    if(this.props.isAppLocked){
      this.props.onSocialShareRequired();      
    }
  }
  render() {
    const { infoText, infoTitle, lockedText, lockedTitle, isAppLocked, rewardedOnly } = this.props;
    const allowDismiss = !isAppLocked;
    const showSocialShare = !rewardedOnly;
    const adBtnStyles = this.state.didRewardAdLoad ? 
      [styles.adBtnContainer]: [styles.adBtnContainer,styles.adBtnDisabled];
    if(rewardedOnly) adBtnStyles.push(styles.adBtnCenter);
    const displayTitle =  allowDismiss ? infoTitle : lockedTitle;
    const displayInfo =  allowDismiss ? infoText : lockedText;
    let { height } = Dimensions.get('window');
    const isSmallDisplay = height <= 568;
    return (
      <View style={styles.container}>
        <HeaderBar title={this.props.screenTitle}>
          {allowDismiss && <BackButton style={styles.backButton} onPressed={this.props.onClose} />}
        </HeaderBar>
        <View style={styles.infoContainer}>
          { !isSmallDisplay && <Image style={styles.heroImg} resizeMode={'contain'} source={require('../assets/splitcloud_round_logo.png')} />}
          <View style={styles.infoTextContainer}>
            <AppText bold={true} style={[styles.infoTitle,styles.extraLineHeigth]}>{displayTitle}</AppText>
            <AppText style={styles.infoDesc}>{displayInfo}</AppText>
          </View>
        </View>
        {isAppLocked && <View style={adBtnStyles}>
          <TouchableOpacity style={[styles.textButtonContainer]} onPress={this.onRewardedAdSelected}>
            <AppText style={styles.infoTitle} bold={true} >Watch a short Ad</AppText>
          </TouchableOpacity>
            {showSocialShare && <AppText bold={true} style={styles.infoTitle}>OR</AppText>}
        </View>}
        {showSocialShare && <View style={styles.socialIconsContainer}>
              <Button style={styles.socialIcon} image={{uri: TWITTER_ICON}} size={'big'} onPressed={this.openShareApp.bind(this,'twitter')}/>
              <Button style={styles.socialIcon} image={{uri: FACEBOOK_ICON}} size={'big'} onPressed={this.openShareApp.bind(this,'facebook')}/>
              <Button style={styles.socialIcon} image={{uri: WHATSAPP_ICON}} size={'big'} onPressed={this.openShareApp.bind(this,'whatsapp')}/>
              <Button style={styles.socialIcon} image={{uri: LINE_ICON}} size={'big'} onPressed={this.openShareApp.bind(this,'line')} />
              <Button style={styles.socialIcon} image={{uri: EMAIL_ICON}} size={'big'} onPressed={this.openShareApp.bind(this,'email')} />
              <Button style={styles.socialIcon} image={{uri: CLIPBOARD_ICON}} size={'big'} onPressed={this.openShareApp.bind(this,'clipboard')} />
        </View>}
      </View>
    );
  }
}
ShareAppScreen.defaultProps = {
  shareOptions : {
    title: 'Try SplitCloud for iOS',
    message: 'With #SplitCloud double music player, you can share your headphones and play two songs at once! Download Free on AppStore:',
    url: 'http://bit.ly/splitcloud',
    subject: 'Checkout this new music app - SplitCloud for iOS' //  for email
  },
  screenTitle: 'Thanks for using SplitCloud!',
  infoTitle: 'Help your friends discover SplitCloud',
  infoText: 'Thanks for using SplitCloud!\nPlease support it by sharing the app link on your social networks and inviting your friends to try it!',
  lockedTitle: 'Thanks for using SplitCloud',
  lockedText : 'We need your support to keep SplitCloud Free!\nTo continue using the app share it or watch a short ad. Thank you!',
};
const mapStateToProps = (state, props) => {
  const didShareOnce =  state.reviewState.shared;
  const interactionCount = state.reviewState.actionCounter;
  const dailyInteractionCount = state.reviewState.dailyActionCounter;
  return {
    didShareOnce,
    interactionCount,
    isAppLocked: (interactionCount >= MAX_INTERACTION_COUNT && !didShareOnce) || 
      dailyInteractionCount >= MAX_DAILY_INTERACTION_COUNT
  };
}
const mapDispatchToProps = (dispatch) => {
  return {
    onPushNotification(message){ dispatch(pushNotification({type:'success',message})); },
    onSocialShareCompleted(platformName){ dispatch(completedSocialShareAction(platformName));},
    onSocialShareAborted(platformName){ dispatch(abortedSocialShareAction(platformName));},
    onSocialShareRequired(){ dispatch(socialShareRequiredAction())},
    pauseAllPlayback(){ dispatch(pauseCurrentTrack('L')); dispatch(pauseCurrentTrack('R'))},
    applyAdReward(){ dispatch(rewarededAdCompletedAction());},
    abortAdReward(){ dispatch(rewardedAdAbortedAction())},
    playRewardedAd(){ dispatch(playRewardedAdAction());}
  }
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer:{
    flexDirection:'row',
  },
  backButton:{
    position:'absolute',
    left:0,
    paddingLeft:10,
    top:10,
    zIndex:20
  },
  heroImg:{
    marginTop:40,
    flex:3,
    width:null,
    height:null,
  },
  infoTextContainer:{
    flex:4,
  },
  infoContainer:{
    flex:1,
    backgroundColor: THEME.mainBgColor,
  },
  infoTitle:{
    color: THEME.mainHighlightColor,
    fontSize: 18,
    lineHeight: 20,
    textAlign:'center',
    paddingVertical:20,
    paddingHorizontal:20,
  },
  extraLineHeigth:{
    lineHeight: 30,
  },
  infoDesc:{
    color: THEME.mainHighlightColor,
    fontSize: 15,
    lineHeight: 20,
    fontWeight:'400',
    paddingHorizontal:20,
  },
  socialIconsContainer:{
    position:'relative',
    bottom:20,
    flexDirection: 'row',
    marginTop: 40,
    marginHorizontal:20,
    padding:20,
    backgroundColor:THEME.notifyBgColor,
    borderRadius:20,
  },
  adBtnContainer:{
    flexDirection:'column',
    alignItems:'center',
    position:'relative',
    bottom:-20,
  },
  adBtnCenter:{
    flex:1,
  },
  adBtnDisabled:{
    opacity:0.5
  },
  textButtonContainer:{
    padding:0,
    width:200,
    backgroundColor:THEME.notifyBgColor,
    borderRadius:20,
  },
  socialIcon:{
    flex:1,
    alignItems:'center'
  }
});

//  twitter icon
const TWITTER_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAABvFBMVEUAAAAA//8AnuwAnOsAneoAm+oAm+oAm+oAm+oAm+kAnuwAmf8An+0AqtUAku0AnesAm+oAm+oAnesAqv8An+oAnuoAneoAnOkAmOoAm+oAm+oAn98AnOoAm+oAm+oAmuoAm+oAmekAnOsAm+sAmeYAnusAm+oAnOoAme0AnOoAnesAp+0Av/8Am+oAm+sAmuoAn+oAm+oAnOoAgP8Am+sAm+oAmuoAm+oAmusAmucAnOwAm+oAmusAm+oAm+oAm+kAmusAougAnOsAmukAn+wAm+sAnesAmeoAnekAmewAm+oAnOkAl+cAm+oAm+oAmukAn+sAmukAn+0Am+oAmOoAmesAm+oAm+oAm+kAme4AmesAm+oAjuMAmusAmuwAm+kAm+oAmuoAsesAm+0Am+oAneoAm+wAmusAm+oAm+oAm+gAnewAm+oAle0Am+oAm+oAmeYAmeoAmukAoOcAmuoAm+oAm+wAmuoAneoAnOkAgP8Am+oAm+oAn+8An+wAmusAnuwAs+YAmegAm+oAm+oAm+oAmuwAm+oAm+kAnesAmuoAmukAm+sAnukAnusAm+oAmuoAnOsAmukAqv9m+G5fAAAAlHRSTlMAAUSj3/v625IuNwVVBg6Z//J1Axhft5ol9ZEIrP7P8eIjZJcKdOU+RoO0HQTjtblK3VUCM/dg/a8rXesm9vSkTAtnaJ/gom5GKGNdINz4U1hRRdc+gPDm+R5L0wnQnUXzVg04uoVSW6HuIZGFHd7WFDxHK7P8eIbFsQRhrhBQtJAKN0prnKLvjBowjn8igenQfkQGdD8A7wAAAXRJREFUSMdjYBgFo2AUDCXAyMTMwsrGzsEJ5nBx41HKw4smwMfPKgAGgkLCIqJi4nj0SkhKoRotLSMAA7Jy8gIKing0KwkIKKsgC6gKIAM1dREN3Jo1gSq0tBF8HV1kvax6+moG+DULGBoZw/gmAqjA1Ay/s4HA3MISyrdC1WtthC9ebGwhquzsHRxBfCdUzc74Y9UFrtDVzd3D0wtVszd+zT6+KKr9UDX749UbEBgULIAbhODVHCoQFo5bb0QkXs1RAvhAtDFezTGx+DTHEchD8Ql4NCcSyoGJYTj1siQRzL/JKeY4NKcSzvxp6RmSWPVmZhHWnI3L1TlEFDu5edj15hcQU2gVqmHTa1pEXJFXXFKKqbmM2ALTuLC8Ak1vZRXRxa1xtS6q3ppaYrXG1NWjai1taCRCG6dJU3NLqy+ak10DGImx07LNFCOk2js6iXVyVzcLai7s6SWlbnIs6rOIbi8ViOifIDNx0uTRynoUjIIRAgALIFStaR5YjgAAAABJRU5ErkJggg==";

//  facebook icon
const FACEBOOK_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAAAYFBMVEUAAAAAQIAAWpwAX5kAX5gAX5gAX5gAXJwAXpgAWZ8AX5gAXaIAX5gAXpkAVaoAX5gAXJsAX5gAX5gAYJkAYJkAXpoAX5gAX5gAX5kAXpcAX5kAX5gAX5gAX5YAXpoAYJijtTrqAAAAIHRSTlMABFis4vv/JL0o4QvSegbnQPx8UHWwj4OUgo7Px061qCrcMv8AAAB0SURBVEjH7dK3DoAwDEVRqum9BwL//5dIscQEEjFiCPhubziTbVkc98dsx/V8UGnbIIQjXRvFQMZJCnScAR3nxQNcIqrqRqWHW8Qd6cY94oGER8STMVioZsQLLnEXw1mMr5OqFdGGS378wxgzZvwO5jiz2wFnjxABOufdfQAAAABJRU5ErkJggg==";

//  whatsapp icon
const WHATSAPP_ICON = "data:image/png;base64,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";

//  email icon
const EMAIL_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAAXNSR0IArs4c6QAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAA7ZJREFUaAXtmMtrU0EUxpPUFz5qK6VW7Kr/gS4CopJSpJQapNZHNW8RoRsX4kZw05ULQbQLoSBoXlJadROLgoiCUBVdKIKgKIogIlqrVNzZxN8JsaQ1CZnMDRU9Ax8z986cmfN9M/e7N3G5tKgCqoAqoAqoAqqAKqAKqAKqgCqgCqgCqoAq8K8p4DYllEqlcqYx9RwfDoeNOHjqmczfOPcS26RyudyEx+OZtJ2nmvhsNrvT7XZvq2ZsuTHWhEnASyJnI5HInXKLOHE/mUwGWGuT7Vw2RzrD4jOglUTG0ul0t20y5eKZO0rfBbAKfACXQE3FhvB1VgyDb6CFXR5lF3pryqJCEHMe5rEZQdSVDHtPvYf6foWQil02hF04ZIZkgmCaRNaBy7j4roorGnRCdpDh58EK8I75+0Oh0EODKf4YakVYZuPZvYFpHaQ5BZpAiiO4ldqqQLYfgsNgORO94QTthuxjq0kJtiYsCZDILXZ5gOYn0EhyV0nYJ321FE7JfuLiYBl4LWSj0egT2tbFEcKShbg0O70P4h/ZlTYwDuku0wyJCRBzkfg11C9nZ2f7IPvMdJ5y4x0jLAsEg8F7kN5Lsyb3XujGDQ0NfbFY7Hm55Gu57yhhSYDjPckujxSSqdq92dliN3Yxx3AgEHhRC6lKMY4TFsPiOIq75gtt3NtV0b0hW+zGv+NOJBIJb2EaxypHCZO4TwyL7BqBGNhJgHu78+5Nfz/X8woCHUWUOTemfYwBX0Azj8c1SG+ZF2B54RhhyHSR7DhoE+MSA+M9fYr2nHvTl8CB5RXmGhoa8hBznP4zXIobvyq8es5RH+D+Z+61C2littN2pDhCmF3qhswYGbWCGTEuMTDJsNi9uVwN4hC42dHRId/ep8FSIG4sr568G1PfLgj1g74N4AoxndTWxZowu9TLjoySSQuQz8ywGFdxZkIeQeST8C2Q3ezh2gdk/ael3BjSdyF9CHxnzHrqcY73DtpWxejHs6yE0rnCikeo5TlNgCYSmqYOy5cXdclCwhshGQGbGfCTmAeQTSHI15IB3GS9Pqo4WAvk2Q6BdiA/JuTz1oiD0WBZoIhwhstOIAY1BYmgfHHRdrwglJ/HJMnEzUDEkcdBTowxYZsjLT8S8m7MTg3Ui6yQ4nhPUMkXWN69qfNkqY2L9R8AkH2E+l6My/F35kI2rCU/HnoW3je5tibMUfaTiN9k0cUca3OkFzNvXVsVUAVUAVVAFVAFVAFVQBVQBVQBVUAVUAVUAVXg/1XgF4b7XC1cfdIkAAAAAElFTkSuQmCC";

//  clipboard icon
const CLIPBOARD_ICON = "data:image/png;base64,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";

const LINE_ICON = "data:image/png;base64,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";

export default connect(mapStateToProps,mapDispatchToProps)(ShareAppScreen);
