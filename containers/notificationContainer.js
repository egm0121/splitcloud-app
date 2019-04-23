/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  LayoutAnimation
} from 'react-native';
import config from '../helpers/config';
import { connect } from 'react-redux';
import NotificationOverlay from '../components/notificationOverlay';
import {clearNotificationById} from '../redux/actions/notificationActions';
import THEME from '../styles/variables';

class NotificationContainer extends Component {
  constructor(props){
    super(props);

  }
  componentWillReceiveProps(newProps){
    if(this.props.notifications.list !==  newProps.notifications.list){
      LayoutAnimation.configureNext({
        ...LayoutAnimation.Presets.linear,
        duration:200
      });
    }
  }
  render() {
    let isForeground = this.props.notifications.list.length > 0;
    return (
      <View style={[styles.container,{height:isForeground ? null : 0}]} pointerEvents='none'>
        {this.props.notifications.list.map((notification) => {
          return <NotificationOverlay
            title={notification.title}
            size={notification.size}
            message={notification.message}
            type={notification.type}
            id={notification.id}
            timeout={notification.timeout}
            imageSource={notification.imageSource}
            key={notification.id}
            onClearNotification={this.props.onClearNotification}
            />
        })}
      </View>
    );
  }
}
NotificationContainer.propTypes = {

}
const styles = StyleSheet.create({
  container: {
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
    justifyContent:'center',
    alignItems:'center'
  }
});
const mapStateToProps = (state,props) => {
  const notificationsState = state.notifications;
  return {
    notifications: notificationsState
  };
}
const mapDispatchToProps = (dispatch,props) => ({
  onClearNotification(notificationId){
    dispatch(clearNotificationById(notificationId));
  }
});
const ConnectedNotificationContainer =
  connect(mapStateToProps,mapDispatchToProps)(NotificationContainer);

AppRegistry.registerComponent('NotificationContainer',
  () => ConnectedNotificationContainer);

export default ConnectedNotificationContainer;
