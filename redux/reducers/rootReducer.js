import { playbackModeTypes , actionTypes } from '../constants/actions';

const initialState = {
  mode : playbackModeTypes.SPLIT,
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
      let itemIndex = state.tracks.findIndex(currAction.track);
      return {
        ...state,
        tracks : itemIndex != null ?
          state.tracks.slice(0).splice(itemIndex,1) : state.tracks
      };
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
      return {
        ...state,
        playlist: currentPlaylistReducer(state.playlist,currAction)
      }
    default:
      return state;
  }

}
export default rootReducer;
