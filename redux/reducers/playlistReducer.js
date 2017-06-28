import initialState from './initialState';
import { actionTypes } from '../constants/actions';
import { REHYDRATE } from 'redux-persist/constants';

function findTrackById(searchId){
  return track => track.id == searchId;
}
function currentPlaylistReducer(state , currAction){
  let toIndex;
  switch(currAction.type){
  case actionTypes.ADD_PLAYLIST_ITEM:
    if((state.tracks).some(findTrackById(currAction.track.id))){
      return state;
    }
    return {
      ...state,
      tracks : [currAction.track, ...state.tracks],
      currentTrackIndex : state.tracks.length ? state.currentTrackIndex + 1 : 0
    };
  case actionTypes.SET_PLAYLIST:
    return {
      ...state,
      tracks : [...currAction.tracks],
      currentTrackIndex:0
    };
  case actionTypes.REMOVE_PLAYLIST_ITEM:
    let toRemoveIdx = state.tracks.findIndex(findTrackById(currAction.track.id));
    let toTrackIdx =  state.currentTrackIndex;
    if( toRemoveIdx < state.currentTrackIndex && state.currentTrackIndex > 0){
      toTrackIdx = state.currentTrackIndex - 1;
    }
    return {
      ...state,
      tracks : toRemoveIdx > -1 ?
        state.tracks.filter( (t,idx) => idx !== toRemoveIdx) : state.tracks,
      currentTrackIndex: toTrackIdx
    };
  case actionTypes.INCREMENT_CURR_PLAY_INDEX:
    if(state.currentTrackIndex == state.tracks.length-1){
      toIndex = 0;
    } else {
      toIndex = state.currentTrackIndex + 1
    }
    return {
      ...state,
      currentTrackIndex: toIndex
    };
  case actionTypes.DECREMENT_CURR_PLAY_INDEX:
    if(state.currentTrackIndex == 0){
      toIndex = 0;
    } else {
      toIndex = state.currentTrackIndex - 1
    }
    return {
      ...state,
      currentTrackIndex: toIndex
    };
  case actionTypes.CHANGE_CURR_PLAY_INDEX:
    toIndex = state.tracks.findIndex(findTrackById(currAction.track.id));
    if( toIndex == -1 ) toIndex = state.currentTrackIndex;
    return {
      ...state,
      currentTrackIndex:toIndex
    };
  default:
    return state;
  }
}
export function playlistReducer(state = initialState.playlist,action){
  switch(action.type){
  case actionTypes.ADD_PLAYLIST_ITEM:
  case actionTypes.REMOVE_PLAYLIST_ITEM:
  case actionTypes.PLAY_PLAYLIST_ITEM:
  case actionTypes.INCREMENT_CURR_PLAY_INDEX:
  case actionTypes.DECREMENT_CURR_PLAY_INDEX:
  case actionTypes.CHANGE_CURR_PLAY_INDEX:
  case actionTypes.SET_PLAYLIST:
    return state.map((playlist)=>{
      if(playlist.side == action.side){
        return {
          ...currentPlaylistReducer(playlist,action),
          rehydrate:false
        };
      }
      return {
        ...playlist,
        rehydrate:false
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
        rehydrate:true
      }
    });
  default:
    return state;
  }
}
