import {
  LayoutAnimation
} from 'react-native';
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
  BUFFERING : 'BUFFERING'
};
export const playlistType = {
  UP_NEXT : 'UP_NEXT_PLAYLIST',
  FAVORITES : '',
  REGULAR : 'REGULAR' 
}
export const messages = {
  SPLIT_MODE_CONTROLS_DISABLED : 'Split Mode On - Tap to control'
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
