import { actionTypes, playbackModeTypes } from '../constants/actions';

export function changePlaybackMode(mode){
  return {
    type : actionTypes.CHANGE_PLAYBACK_MODE,
    mode : mode || playbackModeTypes.SPLIT
  };
}

export function togglePlayerMute(side,mute){
  return {
    type : actionTypes.TOGGLE_PLAYER_MUTE,
    mute,
    side
  };
}

export function togglePlayerPan(side,pan){
  return {
    type : actionTypes.TOGGLE_PLAYER_PAN,
    pan,
    side
  };
}
