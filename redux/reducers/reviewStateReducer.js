import initialState from './initialState';
import { actionTypes } from '../constants/actions';

export function reviewStateReducer(state = initialState.reviewState, currAction){
  switch(currAction.type){
  case actionTypes.INCREMENT_POSITIVE_ACTION:
    return {
      ...state,
      actionCounter : state.actionCounter + 1,
      dailyActionCounter : state.dailyActionCounter + 1,
    }
    break;
  case actionTypes.SET_REVIEW_COMPLETED:
    return {
      ...state,
      done : true
    }
  case actionTypes.SET_SOCIAL_SHARE_COMPLETED:
    return {
      ...state,
      shared : true
    }
  case actionTypes.REWARDED_AD_COMPLETED:
    return {
      ...state,
      actionCounter: 0,
      dailyActionCounter: 0,
    }
  case actionTypes.REWARDED_AD_ABORTED:
    return {
      ...state,
      actionCounter: 0,
      dailyActionCounter: 0,
    }
  default:
    const currDateDay = (new Date()).getDate();
    // day changed reset daily action counter
    if (state.lastDateDay !== currDateDay) {
      return {
        ...state,
        dailyActionCounter: 0,
        lastDateDay: currDateDay,
      }
    }
    return state;
  }
}
