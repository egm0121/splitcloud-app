/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
class NotificationOverlay extends Component {
  constructor(props){
    super(props);

  }
  componentWillMount(){
    setTimeout(() => {
      console.log('notification ',this.props.id, 'will now be cleared');
      this.props.onClearNotification(this.props.id,this.props.timeout);
    },this.props.timeout);
  }
  render() {
    const typeIcon = NotificationOverlay.renderForType[this.props.type].icon;
    return (
        <View style={styles.notificationContainer} >
          <AppText style={styles.iconText}>{typeIcon}</AppText>
          <AppText bold={true} style={styles.messageText}>{this.props.message}</AppText>
          {this.props.children}
        </View>
    );
  }
}
NotificationOverlay.types = {
  error : 'error',
  info : 'info',
  success : 'success'
};
NotificationOverlay.renderForType = {
  'error' : {
    icon : '✕'
  },
  'info' :{
    icon : '!'
  },
  'success':{
    icon : '✓'
  }
},
NotificationOverlay.defaultProps = {
  timeout : 1500,
  type : NotificationOverlay.types.info
};
NotificationOverlay.propTypes = {
  message : PropTypes.string.isRequired,
  type : PropTypes.string,
  id :PropTypes.number.isRequired,
  timeout: PropTypes.number,
  onClearNotification: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  notificationContainer:{
    width:160,
    height:160,
    borderRadius:10,
    paddingHorizontal:10,
    marginVertical:20,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:THEME.notifyBgColor,
    shadowColor:'rgb(0,0,0)',
    shadowRadius:20,
    //shadowOpacity:1
  },
  iconText : {
    textAlign:'center',
    fontSize:60,
    lineHeight:60,
    color: THEME.mainHighlightColor,
  },
  messageText : {
    color: THEME.mainHighlightColor,
    textAlign:'center',
    fontSize: 20
  }
});

export default NotificationOverlay;
