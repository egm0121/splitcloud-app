import { actionTypes } from '../constants/actions';

export function setPlaybackStatus(side,status){
  return {
    type: actionTypes.SET_PLAYBACK_STATUS,
    side: side,
    status,
  }
}