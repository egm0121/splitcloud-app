/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Clipboard,
  View,
  Image,
} from 'react-native';
import { connect } from 'react-redux';
import THEME from '../styles/variables'
import BackButton from '../components/backButton';
import HeaderBar from '../components/headerBar';
import Button from '../components/button';
import AppText from '../components/appText';
import Share from 'react-native-share';
import {
  pushNotification
} from '../redux/actions/notificationActions';

class ShareAppScreen extends Component {
  constructor(props){
    super(props);
    console.log('ShareAppScreen mounted');
  }
  openShareApp(platformName){
    if(platformName == 'clipboard') {
      Clipboard.setString(this.props.shareOptions.url);
      this.props.onPushNotification('Link Copied')
      return true;
    }
    return Share.shareSingle({...this.props.shareOptions, social: platformName});
  }
  render() {
    return (
      <View style={styles.container}>
        <HeaderBar title={this.props.screenTitle}>
          <BackButton style={styles.backButton} onPressed={this.props.onClose} />
        </HeaderBar>
        <View style={styles.infoContainer}>
          <Image style={styles.heroImg} resizeMode={'contain'} source={require('../assets/splitcloud_round_logo.png')} />
          <View style={styles.infoTextContainer}>
            <AppText bold={true} style={styles.infoTitle}>{this.props.infoTitle}</AppText>
            <AppText style={styles.infoDesc}>{this.props.infoText}</AppText>
          </View>
        </View>
        <View style={styles.socialIconsContainer}>
              <Button style={styles.socialIcon} image={{uri: TWITTER_ICON}} size={'big'} onPressed={this.openShareApp.bind(this,'twitter')}/>
              <Button style={styles.socialIcon} image={{uri: FACEBOOK_ICON}} size={'big'} onPressed={this.openShareApp.bind(this,'facebook')}/>
              <Button style={styles.socialIcon} image={{uri: WHATSAPP_ICON}} size={'big'} onPressed={this.openShareApp.bind(this,'whatsapp')}/>
              <Button style={styles.socialIcon} image={{uri: EMAIL_ICON}} size={'big'} onPressed={this.openShareApp.bind(this,'email')} />
              <Button style={styles.socialIcon} image={{uri: CLIPBOARD_ICON}} size={'big'} onPressed={this.openShareApp.bind(this,'clipboard')} />    
        </View> 
      </View>
    );
  }
}
ShareAppScreen.defaultProps = {
  shareOptions : {
    title: 'Try Splitcloud for iOS',
    message: 'With Splitcloud you can listen two different songs at the same time with one phone! get it for free here:',
    url: 'https://itunes.apple.com/app/splitcloud-double-music-player/id1244515007?mt=8',
    subject: 'Checkout this music app - Splitcloud' //  for email
  },
  screenTitle: 'Share SplitCloud App!',
  infoTitle: 'Help your friends discover SplitCloud!',
  infoText: 'If you enjoy using SplitCloud please support it by sharing the app link on your social platforms and inviting your friends to try it!'
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
    flex:3,
    width:null,
    height:null,
  },
  infoTextContainer:{
    flex:4,
  },
  infoContainer:{
    flex:1,
    paddingTop:40,
    backgroundColor: THEME.mainBgColor,
  },
  infoTitle:{
    color: THEME.mainHighlightColor,
    fontSize: 18,
    lineHeight: 30,
    textAlign:'center',
    paddingVertical:20,
    paddingHorizontal:20,
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

const mapDispatchToProps = (dispatch) => {
  return {
    onPushNotification(message){ dispatch(pushNotification({type:'success',message})); } 
  }
};
export default connect(undefined,mapDispatchToProps)(ShareAppScreen);
