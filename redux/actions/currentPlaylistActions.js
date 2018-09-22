import { actionTypes } from '../constants/actions';

export function setPlaylistShuffleMode(side,isActive){
  return {
    type: actionTypes.SET_PLAYLIST_SHUFFLE,
    side,
    value: isActive
  }
}
export function removePlaylistItem(side,track,playlistId){
  return {
    type : actionTypes.REMOVE_PLAYLIST_ITEM,
    track,
    side,
    playlistId
  };
}
export function setPlaylist(side,tracksArr,playlistId) {
  return {
    type : actionTypes.SET_PLAYLIST,
    tracks : tracksArr,
    side,
    playlistId
  };
}
export function addPlaylistItem(side,track,playlistId) {
  return {
    type : actionTypes.ADD_PLAYLIST_ITEM,
    track,
    side,
    playlistId
  };
}
export function incrementCurrentPlayIndex(side,playlistId,shuffle){
  return {
    type: actionTypes.INCREMENT_CURR_PLAY_INDEX,
    side,
    playlistId,
    shuffle
  };
}
export function decrementCurrentPlayIndex(side,playlistId,shuffle){
  return {
    type: actionTypes.DECREMENT_CURR_PLAY_INDEX,
    side,
    playlistId,
    shuffle
  }
}
export function changeCurrentPlayIndex(side,track,playlistId){
  return {
    type: actionTypes.CHANGE_CURR_PLAY_INDEX,
    side,
    track,
    playlistId
  }
}
export function filterPlaylist(side,filterValue,playlistId) {
  return {
    type : actionTypes.FILTER_PLAYLIST,
    value : filterValue,
    side,
    playlistId
  };
}
