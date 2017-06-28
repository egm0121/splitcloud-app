import initialState from './initialState';
import { actionTypes } from '../constants/actions';

function singlePlayerReducer(state,currAction){
  switch(currAction.type){
  case actionTypes.UPDATE_PICKER_SEARCH_TERMS:
    return {...state, searchTerms : currAction.terms};
  case actionTypes.SET_PICKER_LOADING_STATE:
    return {...state, isLoading : currAction.isLoading};
  default:
    return state;
  }
}
export function songPickerReducer(state = initialState.songPickers, currAction){
  switch (currAction.type){
  case actionTypes.UPDATE_PICKER_SEARCH_TERMS:
  case actionTypes.SET_PICKER_LOADING_STATE:
    return state.map((picker) => {
      if(picker.side === currAction.side){
        return singlePlayerReducer(picker,currAction);
      }
      return {...picker};
    });
  default:
    return state;
  }

}
