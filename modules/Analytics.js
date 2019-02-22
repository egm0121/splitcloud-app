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
    const deviceName =  DeviceInfo.getModel().toLocaleLowerCase() !== 'iphone' 
      ? DeviceInfo.getModel() : DeviceInfo.getDeviceId();
    console.log('analytics detected deviceName:',deviceName, 'uid:', uniqClientId);
    this.addSessionDimension(4, deviceName);
  },
  addSessionDimension(index,value){
    return this.ga.addDimension(index,value);
  },
  removeSessionDimension(index){
    return this.ga.removeDimension(index);
  },
  sendScreenView(screenName){
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