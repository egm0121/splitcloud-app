import SplitCloudApi from './SplitcloudApi';
import { updateActiveStreamToken } from './SoundcloudApi';
import config from '../helpers/config';
import throttle from 'lodash.throttle';

class StreamTokenManager {
  constructor(){
    this.api = new SplitCloudApi();
    this.checkActiveToken = throttle(this.checkActiveToken.bind(this),5000,{leading:true});
    this.enabled = true;
  }
  stop(){
    this.enabled = false;
  }
  start(){
    this.enabled = true;
  }
  checkActiveToken(){
    if (!this.enabled){
      console.log('StreamTokenManager is disabled');
      return Promise.resolve(false); 
    } 
    console.log('checkActiveToken called');
    this.api.getApplicationConfig().then( config => {
      if( typeof config === 'object' && 
          config.STREAM_CLIENT_ID &&
          config.STREAM_CLIENT_ID.length >= 32 ){
        updateActiveStreamToken(config.STREAM_CLIENT_ID);
      }
    });
  }
}
const managerService = new StreamTokenManager;
if (config.OVERRIDE_STREAM_TOKEN ){
  managerService.stop();
}
managerService.checkActiveToken();
export default managerService;