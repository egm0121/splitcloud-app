import initialState from './initialState';
import { actionTypes } from '../constants/actions';
import { MAX_REVIEW_POSITIVE_ACTIONS } from '../../helpers/constants';
export function reviewStateReducer(state = initialState.reviewState, currAction){
  switch(currAction.type){
  case actionTypes.INCREMENT_POSITIVE_ACTION:
    
    return {
      ...state,
      actionCounter : state.actionCounter + 1
    }
  default:
    return state;
  }
}
