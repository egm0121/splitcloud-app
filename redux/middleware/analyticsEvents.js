import AnalyticsService from '../../modules/Analytics';
import { actionTypes } from '../constants/actions';
import { getCurrentTrackBySide } from '../selectors/playlistSelector';
import { incrementPositiveAction } from '../actions/storeReviewAction';
import { PLAYBACK_COMPLETE_HIT, PLAYBACK_MIN_TIME } from '../../helpers/constants';
import { isObject } from '../../helpers/utils';
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
  actionTypes.SET_REVIEW_COMPLETED,
  actionTypes.SET_SOCIAL_SHARE_COMPLETED,
  actionTypes.HIT_SOCIAL_SHARE_ABORTED,
  actionTypes.HIT_SOCIAL_SHARE_REQUIRED,
  actionTypes.SET_PLAYLIST_SHUFFLE,
  actionTypes.TOGGLE_PLAYER_REPEAT,
  actionTypes.REWARDED_AD_COMPLETED,
  actionTypes.REWARDED_AD_STARTED,
  actionTypes.SET_PREVIEW_TRACK
];
const actionScreenChangeList = [
  actionTypes.CHANGE_PLAYBACK_MODE
]
const getCategoryFromAction = (action) => {
  return action.side ? 'side-'+action.side : 'app-wide';
};

let lastPlayingTrack = {};
let lastPlayRef = {};
const schedulePlaybackHit = (track,action,cb = () => {} ) => {
  console.log('schedule playback hit for track',track);
  return setTimeout(() => {
    console.log('send completed playback hit for track',track);
    AnalyticsService.sendEvent({
      category: getCategoryFromAction(action),
      action: PLAYBACK_COMPLETE_HIT,
      label: track.provider,
      value: 1,
      dimensions: {
        'cd1': track.id,
        'cd2': AnalyticsService.uniqueClientId,
        'cd3': (new Date).toISOString()
      }
    });
    cb(track);
  },PLAYBACK_MIN_TIME *1e3)
};
const AnalyticsMiddleware = store => {
  return next => {
    return action => {
      if( actionTypeWhitelist.includes(action.type) ){
        AnalyticsService.sendEvent({
          category : action.gaCategory || getCategoryFromAction(action),
          action : action.type,
          label : action.gaLabel || 'redux-action',
          value : 1,
          dimensions: {
            'cd1': action.track && isObject(action.track) ? action.track.id : '', 
            'cd2': AnalyticsService.uniqueClientId,
            'cd3': (new Date).toISOString()
          },
        });
      }
      if( actionScreenChangeList.includes(action.type)){
        AnalyticsService.sendScreenView('MainSceneContainer | mode: '+action.mode);
      }
      let result = next(action);
      if(action.side){
        let currPlayingTrack = getCurrentTrackBySide(store.getState(),action.side);
        if(
          currPlayingTrack &&
          lastPlayingTrack[action.side] !== currPlayingTrack
        ) {
          if(lastPlayRef[action.side]) clearTimeout(lastPlayRef[action.side]);
          lastPlayRef[action.side] = schedulePlaybackHit(currPlayingTrack,action,
          () => {
            store.dispatch(incrementPositiveAction());
          });
          lastPlayingTrack[action.side] = currPlayingTrack;
        }  
      }
      return result;
    }
  }
};

export default AnalyticsMiddleware ;
