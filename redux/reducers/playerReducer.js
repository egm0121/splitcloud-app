import initialState from './initialState';
import { actionTypes, playbackModeTypes } from '../constants/actions';

export function playerReducer(state = initialState.players, currAction){
  switch(currAction.type){
  case actionTypes.INVERT_PLAYER_SIDE :
    return state.map(player => {
      let panning;
      if(player.pan != 0){
        if( player.side == playbackModeTypes.LEFT ){
          panning = currAction.inverted ? 1 : -1
        } else {
          panning = currAction.inverted ? -1 : 1
        }
      } else {
        panning = 0;
      }
      return {
        side : player.side,
        pan : panning,
        muted : player.muted,
        inverted : currAction.inverted
      }
    });
  case actionTypes.CHANGE_PLAYBACK_MODE :
    return state.map((player) => {
      const mode = currAction.mode;
      if( mode == playbackModeTypes.SPLIT) {
        let panning;
        if( player.side == playbackModeTypes.LEFT ){
          panning = player.inverted ? 1 : -1
        } else {
          panning = player.inverted ? -1 : 1
        }
        return {
          side : player.side,
          pan : panning,
          muted : 0,
          inverted : player.inverted
        }
      }
      return {
        side : player.side,
        pan : 0,
        muted : mode == player.side ? 0 : 1,
        inverted : player.inverted
      }
    });
  default:
    return state;
  }
}
