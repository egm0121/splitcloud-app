import {playbackModeTypes} from './constants';

export function formatDuration(seconds,{milli} = {milli :false}){
  if( milli ) seconds = seconds / 1000;
  let min = Math.floor(seconds / 60),
    leftSeconds = seconds - (min * 60),
    pInt = (float) => parseInt(float,10),
    pad = (int) => int < 10 ? `0${pInt(int)}` : `${pInt(int)}`;

  return `${pad(min)}:${pad(leftSeconds)}`;
}
export function formatSidePlayerLabel(side){
  return side.toUpperCase() == playbackModeTypes.RIGHT ? 'right' : 'left';
}
export function ucFirst(str){
  return str[0].toUpperCase() + str.substring(1).toLowerCase();
}
export function formatGenreLabel(key){
  return key.split('_').map(t => ucFirst(t)).join(' ');
}
export function formatFollowerCount(number){
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
};
