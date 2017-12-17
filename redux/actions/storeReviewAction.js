import { actionTypes } from '../constants/actions';

export function incrementPositiveAction(){
  return {
    type : actionTypes.INCREMENT_POSITIVE_ACTION
  }
}
export function reviewCountDoneAction(){
  return {
    type : actionTypes.SET_REVIEW_COMPLETED
  }
}
