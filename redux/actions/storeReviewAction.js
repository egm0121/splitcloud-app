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
export function completedSocialShareAction(){
  return {
    type : actionTypes.SET_SOCIAL_SHARE_COMPLETED
  }
}
export function abortedSocialShareAction(){
  return {
    type : actionTypes.HIT_SOCIAL_SHARE_ABORTED
  }
}
