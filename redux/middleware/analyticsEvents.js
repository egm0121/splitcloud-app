import AnalyticsService from '../../modules/analyticsService';
import { actionTypes } from '../constants/actions';
const actionTypeWhitelist = [
  actionTypes.CHANGE_PLAYBACK_MODE,
  actionTypes.PLAY_PLAYLIST_ITEM,
  actionTypes.SET_PLAYLIST,
  actionTypes.CLEAR_PLAYLIST,
  actionTypes.ADD_PLAYLIST_ITEM,
  actionTypes.REMOVE_PLAYLIST_ITEM,
  actionTypes.INCREMENT_CURR_PLAY_INDEX,
  actionTypes.DECREMENT_CURR_PLAY_INDEX,
  actionTypes.CHANGE_CURR_PLAY_INDEX
];
const AnalyticsMiddleware = store => {
  return next => {
    return action => {
      if( actionTypeWhitelist.indexOf(action.type) > -1 ){
        console.info('Analytics Midd: action ->', action);
        AnalyticsService.sendEvent({
          category :'redux-action',
          action : action.type,
          label :'testing-redux-events',
          value : action.type
        });
      }
      let result = next(action);
      return result;
    }
  }
};

export default AnalyticsMiddleware ;
