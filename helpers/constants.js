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

export const MAX_REVIEW_POSITIVE_ACTIONS=15;
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

export const musicProviderType = {
  SOUNDCLOUD: 'soudcloud',
  LIBRARY: 'library'
}
// min seconds to flag a song as played in stats.
export const PLAYBACK_MIN_TIME = 30; 
export const PLAYBACK_COMPLETE_HIT = 'playback-completed';
export const MAX_INTERACTION_COUNT = 40;