import initialState from './initialState';
import { actionTypes } from '../constants/actions';
import {
  audioPlayerStates,
  PLAYBACK_ENABLED_STATES,
  PLAYBACK_DISABLED_STATES
} from '../../helpers/constants';

export function playbackStatusReducer(state = initialState.playbackStatus, currAction){
  switch(currAction.type){
  case actionTypes.SET_PLAYBACK_STATUS :
    return state.map(player => {
      if(player.side === currAction.side){
        return {
          side: player.side,
          ...currAction.status,
          playerFeedbackState: true
        };
      }
      return player;
    });
  case actionTypes.PLAYBACK_PAUSE : 
    return state.map(player => {
      if(player.side === currAction.side &&
         player.status in PLAYBACK_ENABLED_STATES) {
        return {
          side: player.side,
          playerFeedbackState: false,
          status: audioPlayerStates.PAUSED
        }
      }
      return player;
    });
  case actionTypes.PLAYBACK_PLAY : 
    return state.map(player => {
      if(player.side === currAction.side &&
         player.status in PLAYBACK_DISABLED_STATES) {
        return {
          side: player.side,
          playerFeedbackState: false,
          status: audioPlayerStates.PLAYING
        }
      }
      return player;
    });
  
  default:
    return state;
  }
}
