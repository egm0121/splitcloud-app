import {
  LayoutAnimation
} from 'react-native';
import RNFS from 'react-native-fs';

export const playbackModeTypes = {
  SPLIT : 'S',
  LEFT : 'L',
  RIGHT : 'R'
};
export const soundcloudEndpoint ={
  profileUrl : 'https://soundcloud.com/'
}
export const globalSettings = {
  OFFLINE_MODE : 'offlineMode'
}
export const audioPlayerStates = {
  PLAYING :'PLAYING',
  STOPPED :'STOPPED',
  PAUSED : 'PAUSED',
  BUFFERING : 'BUFFERING',
  LOADING : 'LOADING'
};
export const PLAYBACK_ENABLED_STATES = {
  [audioPlayerStates.PLAYING]:1,
  [audioPlayerStates.BUFFERING]:1
};
export const PLAYBACK_DISABLED_STATES = {
  [audioPlayerStates.STOPPED]:1,
  [audioPlayerStates.PAUSED]:1
};
export const playlistType = {
  UP_NEXT : 'UP_NEXT_PLAYLIST',
  FAVORITES : '',
  REGULAR : 'REGULAR' 
}
export const messages = {
  SPLIT_MODE_CONTROLS_DISABLED : 'Split Mode On - Tap to control',
  EMPTY_LIBRARY_PLAYLIST : 'No tracks found! \n\n Please make sure the music is\n downloaded to your device.\nApple Music tracks not supported.'
}

export const  NOW_PLAYING_ASSET_NAME = 'IconHighRes';

export const VERSION_REDUCER_KEY='app';

export const animationPresets = {

  overlaySlideInOut : {
    ...LayoutAnimation.Presets.easeInEaseOut,
    duration:100
  }
}
export const APP_DOCUMENTS_FOLDER = RNFS.DocumentDirectoryPath;
export const APP_ARTWORK_CACHE_FOLDER = APP_DOCUMENTS_FOLDER + '/' + 'artwork_cache';

export const RESERVED_PLAYLIST_NAME = 'SplitCloud-Favorites';
export const FEATURE_SC_EXPORT = 'feature-export-sc';
export const FEATURE_SOCIAL_SHARE = 'feature-social-share';
export const FEATURE_SHUFFLE = 'feature-shuffle';
export const FEATURE_REPEAT = 'feature-repeat';
export const FEATURE_SUGGESTED = 'feature-suggested';
export const FEATURE_PREVIEW = 'feature-preview';

export const musicProviderType = {
  SOUNDCLOUD: 'soudcloud',
  LIBRARY: 'library'
}

export const ANALYTICS_CATEGORY = {
  SC_API : 'SC_API',
}
// min seconds to flag a song as played in stats.
export const PLAYBACK_MIN_TIME = 30; 
export const PLAYBACK_COMPLETE_HIT = 'playback-completed';
export const PUSH_NOTIFICATION_OPENED_HIT = 'PUSH_NOTIFICATION_OPENED_HIT';
export const SC_STREAM_TOKEN_HIT = 'SC_STREAM_TOKEN_HIT';
export const MAX_INTERACTION_COUNT = 10; //global playback cap
console.warn('using _DEV_ MAX_DAILY_INTERACTION to 3');
export const MAX_DAILY_INTERACTION_COUNT = __DEV__ ? 6 : 35; //daily playback cap 
export const MAX_REVIEW_POSITIVE_ACTIONS = 40;