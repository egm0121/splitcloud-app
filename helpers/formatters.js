import { playbackModeTypes, APP_ARTWORK_CACHE_FOLDER, musicProviderType } from './constants';
export function toInt(float){
  return parseInt(float,10);
}
export function padInt(int){
  return int < 10 ? `0${toInt(int)}` : `${toInt(int)}`;
}
export function formatDuration(seconds,{milli} = {milli :false}){
  if( milli ) seconds = seconds / 1000;
  let min = Math.floor(seconds / 60),
    leftSeconds = seconds - (min * 60);
  return `${padInt(min)}:${padInt(leftSeconds)}`;
}
export function formatDurationExtended(seconds,{milli,fixed} = {milli :false,fixed:false}){
  if( milli ) seconds = seconds / 1000;
  let hours = Math.floor(seconds / (60 * 60)),
    restSec = seconds - Math.floor(hours * 60 * 60);
  if(hours || fixed)return `${padInt(hours)}:${formatDuration(restSec)}`;
  return formatDuration(restSec);
}
export function formatSidePlayerLabel(side){
  return side.toUpperCase() == playbackModeTypes.RIGHT ? 'right' : 'left';
}
export function ucFirst(str){
  if(!str) return '';
  return str[0].toUpperCase() + str.substring(1).toLowerCase();
}
export function formatGenreLabel(key){
  return key.split('_').map(t => ucFirst(t)).join(' ');
}
export function formatNumberPrefix(number){
  if(typeof number != 'number') return'';
  const ranges = [
    { divider: 1e18 , suffix: 'P' },
    { divider: 1e15 , suffix: 'E' },
    { divider: 1e12 , suffix: 'T' },
    { divider: 1e9 , suffix: 'G' },
    { divider: 1e6 , suffix: 'M' },
    { divider: 1e3 , suffix: 'K' }
  ];
  for (var i = 0; i < ranges.length; i++) {
    if (number >= ranges[i].divider) {
      return Math.floor((number / ranges[i].divider)).toString() + ranges[i].suffix;
    }
  }
  return number.toString();
}

export function getArtworkImagePath(filename){
  return 'file://' + APP_ARTWORK_CACHE_FOLDER + '/' + filename;
}

export function isLocalTrack(t){
  return t.provider && t.provider === musicProviderType.LIBRARY;
}