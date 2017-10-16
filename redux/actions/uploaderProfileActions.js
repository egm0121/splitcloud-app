import { actionTypes } from '../constants/actions';

export function updateLastUploaderProfile(side,url){
  return {
    type : actionTypes.UPDATE_LAST_UPLOADER_PROFILE,
    side,
    url
  }
}
