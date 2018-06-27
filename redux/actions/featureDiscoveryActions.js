import { actionTypes } from '../constants/actions';

export function markFeatureDiscovery(name){
  return {
    type : actionTypes.MARK_FEATURE_DISCOVERY,
    name
  };
}
