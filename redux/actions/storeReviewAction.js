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
export function completedSocialShareAction(platformName){
  return {
    type : actionTypes.SET_SOCIAL_SHARE_COMPLETED,
    gaLabel : platformName
  }
}
export function abortedSocialShareAction(platformName){
  return {
    type : actionTypes.HIT_SOCIAL_SHARE_ABORTED,
    gaLabel : platformName
  }
}
export function socialShareRequiredAction() {
  return {
    type: actionTypes.HIT_SOCIAL_SHARE_REQUIRED
  }
}
export function rewarededAdCompletedAction(){
  return {
    type: actionTypes.REWARDED_AD_COMPLETED
  }
}
export function playRewardedAdAction(){
  return {
    type: actionTypes.REWARDED_AD_STARTED
  }
}
export function rewardedAdAbortedAction(){
  return {
    type: actionTypes.REWARDED_AD_ABORTED
  }
}
