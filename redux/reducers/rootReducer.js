import { combineReducers } from 'redux';
import { playbackModeReducer } from './playbackModeReducer';
import { songPickerReducer } from './songPickerReducer';
import { playerReducer } from './playerReducer';
import { notificationReducer } from './notificationReducer';
import { playlistReducer } from './playlistReducer';

const appReducer = combineReducers({
  'mode': playbackModeReducer,
  'songPickers': songPickerReducer,
  'players': playerReducer,
  'playlist': playlistReducer,
  'notifications': notificationReducer
});

export default appReducer;
