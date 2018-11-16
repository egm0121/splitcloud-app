import initialState from './initialState';
import { actionTypes } from '../constants/actions';

export function playbackStatusReducer(state = initialState.playbackStatus, currAction){
  switch(currAction.type){
  case actionTypes.SET_PLAYBACK_STATUS :
    return state.map(player => {
      if(player.side == currAction.side){
        return {
          side: player.side,
          ...currAction.status
        };
      }
      return player;
    });
  
  default:
    return state;
  }
}
