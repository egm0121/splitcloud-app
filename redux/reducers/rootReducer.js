import { playbackModeTypes , actionTypes } from '../constants/actions';

const initialState = {
  mode : playbackModeTypes.SPLIT,
  notifications : {
    list : []
  },
  songPickers :[{
    side : playbackModeTypes.LEFT,
    searchTerms : '',
    recentQueryList : []
  },
  {
    side : playbackModeTypes.RIGHT,
    searchTerms : '',
    recentQueryList : []
  }],
  players : [{
    side: playbackModeTypes.LEFT,
    pan :-1,
    muted : 0
  },{
    side: playbackModeTypes.RIGHT,
    pan : 1,
    muted : 0
  }],
  playlist : [{
    tracks:[],
    currentTrackIndex: 0,
    side : playbackModeTypes.LEFT
  },
  {
    tracks:[],
    currentTrackIndex: 0,
    side : playbackModeTypes.RIGHT
  }]
};

function playersReducer(players, currAction){
  return players.map((state) => {
    const mode = currAction.mode;
    if( mode == playbackModeTypes.SPLIT) {
      return {
        side : state.side,
        pan : state.side == playbackModeTypes.LEFT ? -1 : 1,
        muted : 0
      }
    }
    return {
      side : state.side,
      pan : 0,
      muted : mode == state.side ? 0 : 1
    }
  });
}
function songPickersReducer(state, currAction){
    switch(currAction.type){
      case actionTypes.UPDATE_PICKER_SEARCH_TERMS:
        return state.map((picker) => {
          if(picker.side == currAction.side){
            return {...picker, searchTerms : currAction.terms};
          }
          return {...picker};
        })
      default:
      return state;
    }
}
function currentPlaylistReducer(state, currAction){
  let toIndex;
  switch(currAction.type){
    case actionTypes.ADD_PLAYLIST_ITEM:
      return {
        ...state,
        tracks : [...state.tracks, currAction.track]
      };
    case actionTypes.SET_PLAYLIST:
      return {
        ...state,
        tracks : [...currAction.tracks]
      };
    case actionTypes.REMOVE_PLAYLIST_ITEM:
      let toRemoveIdx = state.tracks.indexOf(currAction.track);
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
      toIndex = state.tracks.indexOf(currAction.track);
      if( toIndex == -1 ) toIndex = state.currentTrackIndex;
      return {
        ...state,
        currentTrackIndex:toIndex
      };
    default:
      return state;
  }
}
function playlistsReducer(state,action){
  return state.map((playlist)=>{
     if(playlist.side == action.side){
       return currentPlaylistReducer(playlist,action);
     }
     return playlist;
  })
}
function notificationReducer(state, currAction){

    switch(currAction.type){
      case actionTypes.CLEAR_NOTIFICATION:
        return {
          ...state,
          list :state.list.filter((curr) => curr.id != currAction.id)
        }
      case actionTypes.ADD_NOTIFICATION:
        return {
          ...state,
          list : [currAction.notification,...state.list]
        }
      default:
      return state;
    }
}
function rootReducer(state = initialState, currAction){

  switch(currAction.type) {
    case actionTypes.UPDATE_PICKER_SEARCH_TERMS :
      return {
        ...state,
        songPickers: songPickersReducer(state.songPickers,currAction)
      }
    case actionTypes.CHANGE_PLAYBACK_MODE :
      return { ...state,
        mode : currAction.mode,
        players: playersReducer(state.players,currAction)
      };
    case actionTypes.ADD_PLAYLIST_ITEM:
    case actionTypes.REMOVE_PLAYLIST_ITEM:
    case actionTypes.PLAY_PLAYLIST_ITEM:
    case actionTypes.INCREMENT_CURR_PLAY_INDEX:
    case actionTypes.DECREMENT_CURR_PLAY_INDEX:
    case actionTypes.CHANGE_CURR_PLAY_INDEX:
      return {
        ...state,
        playlist: playlistsReducer(state.playlist,currAction)
      }
    case actionTypes.CLEAR_NOTIFICATION:
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: notificationReducer(state.notifications,currAction)
      }
    default:
      return state;
  }
}
export default rootReducer;
