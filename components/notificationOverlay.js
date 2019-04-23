/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
import THEME from '../styles/variables';
import AppText from './appText';
import { ucFirst } from '../helpers/formatters';
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
    const sizeStyle = styles[`size${ucFirst(this.props.size)}`];
    const hasImage = this.props.type === 'image';
    const hasTitle = !!this.props.title;
    const typeIcon = !hasImage && NotificationOverlay.renderForType[this.props.type].icon;
    return (
        <View style={[styles.notificationContainer,sizeStyle]} >
           {hasTitle && <AppText bold={true} style={styles.titleText}>{this.props.title}</AppText>}
           {hasImage ? 
            <Image style={[styles.imageStyle]} resizeMode={'contain'} source={this.props.imageSource} /> :
            <AppText style={styles.iconText}>{typeIcon}</AppText>}
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
  type : NotificationOverlay.types.info,
  size : 'small'
};
NotificationOverlay.propTypes = {
  title: PropTypes.string,
  message : PropTypes.string.isRequired,
  type : PropTypes.string,
  id :PropTypes.number.isRequired,
  timeout: PropTypes.number,
  onClearNotification: PropTypes.func.isRequired,
  containerStyle: PropTypes.object,
  imageSource: PropTypes.object,
  size: PropTypes.string
};

const styles = StyleSheet.create({
  notificationContainer:{
    width:180,
    height:180,
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
  sizeBig:{
    width:250,
    height:250,
    borderRadius:20,
  },
  imageStyle:{
    width:100,
    height:100,
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
    fontSize: 18
  },
  titleText:{
    color: THEME.mainHighlightColor,
    textAlign:'center',
    fontSize: 18
  }
});

export default NotificationOverlay;
