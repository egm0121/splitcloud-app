import initialState from './initialState';
import { actionTypes, playbackModeTypes } from '../constants/actions';

export function playerReducer(state = initialState.players, currAction){
  switch(currAction.type){
  case actionTypes.CHANGE_PLAYBACK_MODE :
    return state.map((player) => {
      const mode = currAction.mode;
      if( mode == playbackModeTypes.SPLIT) {
        return {
          side : player.side,
          pan : player.side == playbackModeTypes.LEFT ? -1 : 1,
          muted : 0
        }
      }
      return {
        side : player.side,
        pan : 0,
        muted : mode == player.side ? 0 : 1
      }
    });
  default:
    return state;
  }
}
