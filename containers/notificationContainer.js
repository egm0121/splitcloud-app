/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View
} from 'react-native';
import config from '../helpers/config';
import { connect } from 'react-redux';

import NotificationOverlay from '../components/notificationOverlay';
import {clearNotificationById} from '../redux/actions/notificationActions';
import THEME from '../styles/variables';

class NotificationContainer extends Component {
  constructor(props){
    super(props);
    console.log('NotificationContainer init props',this.props);

  }
  componentWillReceiveProps(newProps){
    console.log('NotificationContainer received props',newProps);
  }

  render() {
    let isForeground = this.props.notifications.list.length > 0;
    return (
      <View style={[styles.container,{zIndex:isForeground ? 1:-1}]}>
        {this.props.notifications.list.map((notification) => {
          return <NotificationOverlay
            message={notification.message}
            type={notification.type}
            id={notification.id}
            timeout={notification.timeout}
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
    console.log('should dispatch an action to remove the notification from the state');
    dispatch(clearNotificationById(notificationId));
  }

});
NotificationContainer = connect(mapStateToProps,mapDispatchToProps)(NotificationContainer);

AppRegistry.registerComponent('NotificationContainer', () => NotificationContainer);

export default NotificationContainer;
