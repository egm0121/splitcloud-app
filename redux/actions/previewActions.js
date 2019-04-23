import { actionTypes } from '../constants/actions';

export function setPreviewTrack(side,track){
  return {
    type : actionTypes.SET_PREVIEW_TRACK,
    side : side,
    track
  };
}