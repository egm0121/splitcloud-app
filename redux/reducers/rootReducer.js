import { combineReducers } from 'redux';
import {VERSION_REDUCER_KEY} from '../../helpers/constants';
import { playbackModeReducer } from './playbackModeReducer';
import { songPickerReducer } from './songPickerReducer';
import { playerReducer } from './playerReducer';
import { notificationReducer } from './notificationReducer';
import { playlistReducer } from './playlistReducer';
import { settingsReducer } from './settingsReducer';
import { uploaderProfileReducer } from './uploaderProfileReducer';
import { storeVersionReducer } from './storeVersionReducer';
import { playlistStoreReducer } from './playlistStoreReducer';
import { reviewStateReducer } from './reviewStateReducer';
import { featureDiscoveryReducer } from './featureDiscoveryReducer';
import { playbackStatusReducer } from './playbackStatusReducer';
import { previewReducer } from './previewReducer';

const appReducer = combineReducers({
  [VERSION_REDUCER_KEY] : storeVersionReducer,
  'mode': playbackModeReducer,
  'songPickers': songPickerReducer,
  'players': playerReducer,
  'playlist': playlistReducer,
  'notifications': notificationReducer,
  'settings': settingsReducer,
  'uploaderProfile': uploaderProfileReducer,
  'playlistStore':playlistStoreReducer,
  'backup': (state = {}) => state,
  'reviewState': reviewStateReducer,
  'featureDiscovery': featureDiscoveryReducer,
  'playbackStatus': playbackStatusReducer,
  'preview': previewReducer,
});

export default appReducer;
