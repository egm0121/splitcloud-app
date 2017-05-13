import { actionTypes } from '../constants/actions';

export function removeQueuedTrack(side,track){
  return {
    type : actionTypes.REMOVE_PLAYLIST_ITEM,
    track,
    side
  };
}
export function setPlaylist(side,tracksArr) {
  return {
    type : actionTypes.SET_PLAYLIST,
    tracks : tracksArr,
    side
  };
}
export function addPlaylistItem(side,track) {
  return {
    type : actionTypes.ADD_PLAYLIST_ITEM,
    track,
    side
  };
}
export function incrementCurrentPlayIndex(side){
  return {
    type: actionTypes.INCREMENT_CURR_PLAY_INDEX,
    side
  };
}
export function decrementCurrentPlayIndex(side){
  return {
    type: actionTypes.DECREMENT_CURR_PLAY_INDEX,
    side
  }
}
export function changeCurrentPlayIndex(side,track){
  return {
    type: actionTypes.CHANGE_CURR_PLAY_INDEX,
    side,
    track
  }
}
