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
    this.uniqueClientId = uniqClientId;
    this.trackingAppName = appName;
    this.currentRootScreen = ''; 
    this.ga = new Analytics(trackerId, uniqClientId, 1, DeviceInfo.getUserAgent());
    this.processPrematureHitsQueue();
  },
  sendScreenView(screenName){
    console.log('SEND SCREEN VIEW',screenName);
    this.currentRootScreen = screenName;
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
  sendNestedScreenView(subView){
    let screenName = [this.currentRootScreen, subView].join(' - ');
    console.log('SEND SCREEN VIEW -nested',screenName);
    let screenView = new GAHits.ScreenView(
      this.trackingAppName,
      screenName,
      DeviceInfo.getReadableVersion(),
      DeviceInfo.getBundleId()
    );
    this.ga.send(screenView);
  },
  sendEvent({category,action,label,value,dimensions}){
    if(!this.ga){
      this.initialBuffer.push(
        () => this.sendEvent({category,action,label,value,dimensions})
      );
      return false;
    }
    label = (label || `${category} - ${action}`).substr(0,250);
    let eventHit = new GAHits.Event(category,action,label,value);
    if(typeof dimensions == 'object'){
      console.log('Adding custom dimension to event',dimensions);
      eventHit.set(dimensions);
      console.log('Serialized ga event',eventHit.toQueryString());
    }
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