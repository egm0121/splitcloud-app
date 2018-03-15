import AnalyticsService from '../../modules/Analytics';
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
  actionTypes.CHANGE_CURR_PLAY_INDEX,
  actionTypes.INVERT_PLAYER_SIDE,
  actionTypes.SET_GLOBAL_SETTING,
  actionTypes.INCREMENT_POSITIVE_ACTION,
  actionTypes.FILTER_PLAYLIST,
  actionTypes.SET_REVIEW_COMPLETED
];
const getCategoryFromAction = (action) => {
  return action.side ? 'side-'+action.side : 'app-wide';
};
const AnalyticsMiddleware = store => {
  return next => {
    return action => {
      if( actionTypeWhitelist.indexOf(action.type) > -1 ){
        AnalyticsService.sendEvent({
          category :getCategoryFromAction(action),
          action : action.type,
          label :'redux-action',
          value : 1
        });
      }
      let result = next(action);
      return result;
    }
  }
};

export default AnalyticsMiddleware ;
