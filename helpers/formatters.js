export function formatDuration(seconds,{milli} = {milli :false}){
  if( milli ) seconds = seconds / 1000;
  let min = Math.floor(seconds / 60),
    leftSeconds = seconds - (min * 60),
    pInt = (float) => parseInt(float,10),
    pad = (int) => int < 10 ? `0${pInt(int)}` : `${pInt(int)}`;

  return `${pad(min)}:${pad(leftSeconds)}`;
}
export function ucFirst(str){
  return str[0].toUpperCase() + str.substring(1).toLowerCase();
}
