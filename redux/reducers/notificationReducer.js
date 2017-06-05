import initialState from './initialState';
import { actionTypes } from '../constants/actions';

export function notificationReducer(state = initialState.notifications, currAction){

  switch(currAction.type){
  case actionTypes.CLEAR_NOTIFICATION:
    return {
      ...state,
      list :state.list.filter((curr) => curr.id != currAction.id)
    }
  case actionTypes.ADD_NOTIFICATION:
    return {
      ...state,
      list : [currAction.notification,...state.list]
    }
  default:
  return state;
  }
}
