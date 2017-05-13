import { actionTypes, playbackModeTypes } from '../constants/actions';

export function updateSearchTerms(side, terms){
  return {
    type : actionTypes.UPDATE_PICKER_SEARCH_TERMS,
    terms,
    side
  };
}
