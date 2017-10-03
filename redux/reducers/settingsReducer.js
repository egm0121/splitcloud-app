import initialState from './initialState';
import { actionTypes } from '../constants/actions';

export function settingsReducer(state = initialState.settings, currAction){
  switch(currAction.type){
  case actionTypes.SET_GLOBAL_SETTING:
    return {
      ...state,
      [currAction.key] : currAction.value
    }
  default:
    return state;
  }
}
