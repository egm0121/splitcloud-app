import { actionTypes } from '../constants/actions';

export function removeQeueuedTrack(side,track){
  return {
    type : actionTypes.REMOVE_PLAYLIST_ITEM,
    track,
    side
  };
}
