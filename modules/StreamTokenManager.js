import SplitCloudApi from './SplitcloudApi';
import { updateActiveStreamToken } from './SoundcloudApi';
import throttle from 'lodash.throttle';

class StreamTokenManager {
  constructor(){
    this.api = new SplitCloudApi();
    this.checkActiveToken = throttle(this.checkActiveToken.bind(this),5000,{leading:true});
  }
  checkActiveToken(){
    console.log('checkActiveToken called');
    this.api.getApplicationConfig().then( config => {
      updateActiveStreamToken(config.STREAM_CLIENT_ID);
    });
  }
}
const managerService = new StreamTokenManager;
managerService.checkActiveToken();
export default managerService;