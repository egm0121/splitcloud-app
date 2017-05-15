import { actionTypes } from '../constants/actions';
let _notificationId = 0;
export function clearNotificationById(id){
  return {
    type : actionTypes.CLEAR_NOTIFICATION,
    id
  }
}

export function pushNotification(notification){
  notification.id = _notificationId++;
  return {
    type : actionTypes.ADD_NOTIFICATION,
    notification
  }
}
