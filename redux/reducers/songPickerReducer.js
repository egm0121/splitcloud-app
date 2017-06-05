import initialState from './initialState';
import { actionTypes } from '../constants/actions';

export function songPickerReducer(state = initialState.songPickers, currAction){
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
