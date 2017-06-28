import { actionTypes, playbackModeTypes } from '../constants/actions';

export function updateSearchTerms(side, terms){
  return {
    type : actionTypes.UPDATE_PICKER_SEARCH_TERMS,
    terms,
    side
  };
}

export function setLoading(side, isLoading){
  return {
    type : actionTypes.SET_PICKER_LOADING_STATE,
    isLoading,
    side
  };
}
