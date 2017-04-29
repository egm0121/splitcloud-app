import { actionTypes } from '../constants/actions';

export function removeQeueuedTrack(side,track){
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
export function addPlaylistTrack(side,track) {
  return {
    type : actionTypes.ADD_PLAYLIST_ITEM,
    track,
    side
  };
}
