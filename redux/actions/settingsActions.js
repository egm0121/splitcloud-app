import { actionTypes } from '../constants/actions';

export function setGlobalSetting(key,value){
  return {
    type : actionTypes.SET_GLOBAL_SETTING,
    key,
    value
  }
}
