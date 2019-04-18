import initialState from './initialState';
import { actionTypes } from '../constants/actions';

export function previewReducer(state = initialState.preview, currAction){
  switch(currAction.type){
  case actionTypes.SET_PREVIEW_TRACK :
    return state.map(preview => {
      if(preview.side === currAction.side){
        return {
          ...preview,
          track: currAction.track
        };
      }
      return preview;
    });
  default:
    return state;
  }
}
