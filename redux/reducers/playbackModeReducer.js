import initialState from './initialState';
import { actionTypes } from '../constants/actions';

export function playbackModeReducer (state = initialState.mode ,currAction){
  switch(currAction.type){
  case actionTypes.CHANGE_PLAYBACK_MODE:
    return currAction.mode;
  default:
    return state;
  }
}
