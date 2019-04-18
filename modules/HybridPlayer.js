import { ReactNativeStreamingPlayer } from 'react-native-audio-streaming';
import {audioPlayerStates} from '../helpers/constants';
import SoundPlayer from 'react-native-sound';
import Bugsnag from './Bugsnag';

const {
  PLAYING,
  STOPPED,
  PAUSED,
} = audioPlayerStates;
export default class HybridPlayer extends ReactNativeStreamingPlayer {

  constructor(){
    super();
    this.emitCurrentStateEvent = this.emitCurrentStateEvent.bind(this);
    this.setSoundPlayerStatus = this.setSoundPlayerStatus.bind(this);
    this.itunesPlayer = null;
    this.state = {
      playerMode: HybridPlayer.STREAMING,
      pan:  0,
      volume: 1,
      prevStatus: null,
      status : STOPPED,
      playWhenReady : false,
      isPlaybackReady : false 
    }
  }
  getPlayerMode(){
    return this.state.playerMode;
  }
  setPlayerMode( playerMode ){
    const validModes = [HybridPlayer.STREAMING, HybridPlayer.ITUNES ];
    if(!validModes.includes(playerMode)) return false;
    return this.state.playerMode = playerMode;
  }
  setSoundPlayerStatus(status){
    
    this.state.prevStatus = this.state.status;
    this.state.status = status;
    console.log('setSoundPlayerStatus: ',this.state.status);
    return this.state.status;
  }
  emitCurrentStateEvent(overridePayload = {}){
    let statePayload = {
      status: this.state.status,
      progress: 0,
      duration: this.itunesPlayer.getDuration(),
      prevStatus: this.state.prevStatus,
      ...overridePayload
    };
    console.log('emitCurrentStateEvent',statePayload);
    return this.trigger('stateChange',statePayload);
  }
  play(){
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.play();
    }
    console.log('play itunes song',this.itunesPlayer);
    if(!this.state.isPlaybackReady){
      console.log('defer play itunes song until is ready');
      this.state.playWhenReady = true;
      return;
    }
    if(this.itunesPlayer){
      
      this.setSoundPlayerStatus(PLAYING);
      this.emitCurrentStateEvent();
      
      this.itunesPlayer.play((success) => {
        this.setSoundPlayerStatus(STOPPED);
        this.emitCurrentStateEvent({ 
          progress: 0, 
          duration: 0, 
          isError : !success
        });
      });
    }
  }
  pause(){
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.pause();
    } else {
      if(!this.state.isPlaybackReady){
        console.log('cancel defered play itunes song');
        this.state.playWhenReady = false;
        return;
      }
      this.setSoundPlayerStatus(PAUSED);
      this.emitCurrentStateEvent();
      return this.itunesPlayer.pause();
    }
  }
  resume(){
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.resume();
    } else {
      return this.play();
    }
  }
  stop(){
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.stop();
    } else {
      this.state.isPlaybackReady = false;
      this.state.playWhenReady = false; 
      return this.itunesPlayer.stop(() => {
        this.setSoundPlayerStatus(STOPPED);
        this.emitCurrentStateEvent();
      });
    }
  }
  setVolume(volume){
    this.state.volume = volume;
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.setVolume(volume);
    }
    if(this.itunesPlayer){
      this.itunesPlayer.setVolume(volume);
    }
  }
  setPan(pan){
    this.state.pan = pan;
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.setPan(pan);
    }
    if(this.itunesPlayer){
      this.itunesPlayer.setPan(pan);
    }
  }
  seekToTime(time){ 
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.seekToTime(time);
    } else {
      return this.itunesPlayer.setCurrentTime(time);
    }
  }
  getStatus(cb){
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.getStatus(cb);
    } else {
      this.itunesPlayer.getCurrentTime( currTime => {
        cb(null,{
          progress: currTime,
          duration: this.itunesPlayer.getDuration(),
          status: this.state.status,
        })
      })
    }
  }
  isPlaying(cb){
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.isPlaying(cb);
    } else {
      cb(false,!!this.itunesPlayer.isPlaying())
    }
  }
  isPaused(cb){
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.isPaused(cb);
    } else{
      cb(false,!this.itunesPlayer.isPlaying());
    }
  }
  setSoundUrl(soundUrl){
    this.state.soundUrl = soundUrl;
    this.state.playerMode = soundUrl.indexOf('ipod-library://') == 0 ?
      HybridPlayer.ITUNES : HybridPlayer.STREAMING;
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.setSoundUrl(soundUrl)
    }
    this.state.isPlaybackReady = false;
    if(this.itunesPlayer){
      this.itunesPlayer.stop(() => {
        this.itunesPlayer.release();
        this._createNewSoundPlayerWithUrl(soundUrl);
      });
    } else {
      this._createNewSoundPlayerWithUrl(soundUrl);
    } 
    
  }
  _createNewSoundPlayerWithUrl(soundUrl){
    console.log('setSoundUrl with url',soundUrl,'state', this.state);
    this.itunesPlayer = new SoundPlayer(soundUrl,'',(err) => {
      if(err){
        console.log('Error loading SoundPlayer',err);
        Bugsnag.notify(new Error('createNewSoundPlayerWithUrl: '+soundUrl+' failed'));
      } else {
        this.state.isPlaybackReady = true;
        this.itunesPlayer.setVolume(this.state.volume);
        this.itunesPlayer.setPan(this.state.pan);

        if(this.state.playWhenReady){
          this.play();
        }
        console.log('correctly loaded soundUrl on SoundPlayer instance');
      }
    });
   
    this.emitCurrentStateEvent();
  }
  getSoundUrl(){
    return this.state.soundUrl;
  }
  getPan(cb){
    return cb(false,this.state.pan);
  }
  getVolume(cb){
    return cb(false,this.state.volume);
  }
  destroy(){
    if(this.state.playerMode == HybridPlayer.STREAMING){
      return super.destroy();
    } else{
      this.itunesPlayer.release();
    }
  }

}
HybridPlayer.STREAMING = 'streaming';
HybridPlayer.ITUNES = 'itunes';