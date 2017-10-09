import initialState from './initialState';
import { actionTypes } from '../constants/actions';
import { REHYDRATE } from 'redux-persist/constants';

function findTrackById(searchId){
  return track => track.id == searchId;
}
function applyFilterVisibility(value){
  return (track) => {
    if(!value.length || value == '') return {...track,isVisible:true};
    let matchString = track.label.toLowerCase() + '' + track.username.toLowerCase();
    let isVisible = matchString.indexOf(value.toLowerCase()) != -1;
    return {...track,isVisible};
  }
}
function getNextVisibleIndex(index,queue,originIndex){
  let next = index,foundIndex = false;
  while(queue[++next]){
    if(queue[next].isVisible){
      foundIndex = next;
      break;
    }
  }
  if(foundIndex == false){
    if(index == 0 && originIndex != undefined){
      return originIndex;
    } else {
      return queue[0].isVisible ? 0 : getNextVisibleIndex(0,queue,index);
    }
  }
  return foundIndex;
}
function getPrevVisibleIndex(index,queue){
  if(index == 0) return 0;
  let prev = index,foundIndex = index;
  while(queue[--prev]){
    if(queue[prev].isVisible){
      foundIndex = prev;
      break;
    }
  }
  return foundIndex;
}
function currentPlaylistReducer(state , currAction){
  let toIndex;
  switch(currAction.type){
  case actionTypes.FILTER_PLAYLIST:
    return {
      ...state,
      filterTracks: currAction.value,
      //TODO: change visibility flag
      playbackQueue: state.playbackQueue.map(applyFilterVisibility(currAction.value))
    };
  case actionTypes.ADD_PLAYLIST_ITEM:
    if((state.playbackQueue).some(findTrackById(currAction.track.id))){
      return state;
    }
    let currTrack = applyFilterVisibility(state.filterTracks)(currAction.track);
    return {
      ...state,
      playbackQueue : [currTrack, ...state.playbackQueue],
      currentTrackIndex : state.playbackQueue.length ? state.currentTrackIndex + 1 : 0,
      autoplay : true
    };
  case actionTypes.SET_PLAYLIST:
    return {
      ...state,
      playbackQueue : [...currAction.tracks].map(applyFilterVisibility(state.filterTracks)),
      currentTrackIndex:0,
      autoplay : true
    };
  case actionTypes.REMOVE_PLAYLIST_ITEM:
    let toRemoveIdx = state.playbackQueue.findIndex(findTrackById(currAction.track.id));
    let toTrackIdx =  state.currentTrackIndex;
    if( toRemoveIdx < state.currentTrackIndex && state.currentTrackIndex > 0){
      toTrackIdx = state.currentTrackIndex - 1;
    }
    return {
      ...state,
      playbackQueue : toRemoveIdx > -1 ?
        state.playbackQueue.filter( (t,idx) => idx !== toRemoveIdx) : state.playbackQueue,
      currentTrackIndex: toTrackIdx,
      autoplay : false
    };
  case actionTypes.INCREMENT_CURR_PLAY_INDEX:
    let nextIndex = getNextVisibleIndex(state.currentTrackIndex, state.playbackQueue);
    return {
      ...state,
      currentTrackIndex:nextIndex,
      autoplay : true
    };
  case actionTypes.DECREMENT_CURR_PLAY_INDEX:
    let prevIndex = getPrevVisibleIndex(state.currentTrackIndex, state.playbackQueue);
    return {
      ...state,
      currentTrackIndex: prevIndex,
      autoplay : true
    };
  case actionTypes.CHANGE_CURR_PLAY_INDEX:
    toIndex = state.playbackQueue.findIndex(findTrackById(currAction.track.id));
    if( toIndex == -1 ) toIndex = state.currentTrackIndex;
    return {
      ...state,
      currentTrackIndex:toIndex,
      autoplay : true
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
  case actionTypes.FILTER_PLAYLIST:
    return state.map((playlist)=>{
      if(playlist.side == action.side){
        return {
          ...currentPlaylistReducer(playlist,action)
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
