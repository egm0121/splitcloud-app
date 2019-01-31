import { actionTypes } from '../constants/actions';

export function setPlaybackStatus(side,status){
  return {
    type: actionTypes.SET_PLAYBACK_STATUS,
    side: side,
    status,
  }
}

export function playCurrentTrack(side){
  return {
    type: actionTypes.PLAYBACK_PLAY,
    side
  };
}
export function pauseCurrentTrack(side){
  return {
    type: actionTypes.PLAYBACK_PAUSE,
    side,
  };
}