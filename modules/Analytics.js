import {
  Analytics,
  Hits as GAHits
} from 'react-native-google-analytics';
import DeviceInfo from 'react-native-device-info';

let uniqClientId = DeviceInfo.getUniqueID();

let AnalyticsService = {
  ga : null,
  initialBuffer : [],
  initialize(trackerId,appName){
    this.trackingAppName = appName;
    this.ga = new Analytics(trackerId, uniqClientId, 1, DeviceInfo.getUserAgent());
    this.processPrematureHitsQueue();
  },
  sendScreenView(screenName){
    if(!this.ga){
      this.initialBuffer.push(() => this.sendScreenView(screenName));
      return false;
    }
    let screenView = new GAHits.ScreenView(
         this.trackingAppName,
         screenName,
         DeviceInfo.getReadableVersion(),
         DeviceInfo.getBundleId()
       );
    this.ga.send(screenView);
  },
  sendEvent({category,action,label,value}){
    if(!this.ga){
      this.initialBuffer.push(
        () => this.sendEvent({category,action,label,value})
      );
      return false;
    }
    label = label || `${category} - ${action}`;
    let eventHit = new GAHits.Event(category,action,label,value);
    this.ga.send(eventHit);
  },
  processPrematureHitsQueue(){
    if(this.initialBuffer.length){
      console.log('processing early ga Hits');
    }
    this.initialBuffer.forEach((dispatchHit) => dispatchHit());
    this.initialBuffer = [];
  }
}
export default AnalyticsService;