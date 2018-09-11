import initialState from './initialState';
import { actionTypes } from '../constants/actions';
import { REHYDRATE } from 'redux-persist/constants';


function currentPlaylistReducer(state , currAction){
  let toIndex;
  switch(currAction.type){
  case actionTypes.CHANGE_CURR_PLAY_INDEX:
  case actionTypes.PLAY_PLAYLIST_ITEM:
    return {
      ...state,
      currentPlaylistId: currAction.playlistId || 'playbackQueue_' + currAction.side
    };
  case actionTypes.FILTER_PLAYLIST:
    return {
      ...state,
      filterTracks:currAction.value //TODO: deprecate filter playlist , moved to playlistStore
    }
  case actionTypes.SET_PLAYLIST_SHUFFLE:
    return {
      ...state,
      shuffle: currAction.value
    }
  default:
    return state;
  }
}
export function playlistReducer(state = initialState.playlist,action){
  switch(action.type){
  case actionTypes.PLAY_PLAYLIST_ITEM:
  case actionTypes.CHANGE_CURR_PLAY_INDEX:
  case actionTypes.FILTER_PLAYLIST:
  case actionTypes.SET_PLAYLIST_SHUFFLE:
    return state.map((playlist)=>{
      if(playlist.side == action.side){
        return {
          ...currentPlaylistReducer(playlist,action) //TODO: deprecate filter playlist , moved to playlistStore
        };
      }
      return {
        ...playlist,
        autoplay:true
      };
    });
    /*
     in case of reydration use the rehydrate flag to indicate that it is not
     the result of a user interaction thus no automatic playback should be triggered
     */
  case REHYDRATE:
    return (action.payload.playlist || state).map((playlist) => {
      return {
        ...playlist,
        autoplay:false
      }
    });
  default:
    return state;
  }
}
