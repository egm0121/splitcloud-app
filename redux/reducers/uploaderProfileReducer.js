import initialState from './initialState';
import { actionTypes } from '../constants/actions';

export function uploaderProfileReducer(state = initialState.uploaderProfile, currAction){
  switch(currAction.type){
  case actionTypes.UPDATE_LAST_UPLOADER_PROFILE :
    return state.map(profile => {
      if(profile.side != currAction.side) return profile;
      return {
        side : profile.side,
        lastUploaderUrl: currAction.url
      }
    });
  default:
    return state;
  }
}
