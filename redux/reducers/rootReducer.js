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
    default:
      return state;
  }

}
export default rootReducer;
