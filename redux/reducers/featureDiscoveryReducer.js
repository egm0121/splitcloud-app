import initialState from './initialState';
import { actionTypes } from '../constants/actions';

export function featureDiscoveryReducer(state = initialState.featureDiscovery, currAction){
  switch(currAction.type){
  case actionTypes.MARK_FEATURE_DISCOVERY:
    return {
      ...state,
      [currAction.name] : false
    }
  default:
    return state;
  }
}
