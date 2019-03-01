import axios from 'axios';
import CacheDecorator from '../helpers/cacheDecorator';
import SoundCloudApi from './SoundcloudApi';
import { toArray } from '../helpers/utils';

class SplitCloud {

  constructor(opts = {}){
    this.endpoint = 'www.splitcloud-app.com';
    this.scApi = new SoundCloudApi(opts);
    this.timeout = 4*1e3;
    this.extendedTimeout = 10*1e3;
    
    this.initializeCacheDecorators();
  }
  initializeCacheDecorators(){

    this.getWeeklyPopular = CacheDecorator.withCache(
      this.getWeeklyPopular.bind(this),
      'getWeeklyPopular',
      3600*1e3
    );
    this.getDiscoveryPlaylists = CacheDecorator.withCache(
      this.getDiscoveryPlaylists.bind(this),
      'getDiscoveryPlaylists',
      3600*1e3
    )
  }
  request(...args){
    let requestObj = this._buildRequestObject(...args);
    console.log('splitcloud api request object',requestObj);
    return axios(requestObj);
  }
  _toQueryString(paramObj){
    return Object.keys(paramObj)
      .filter((key) => paramObj[key] != undefined)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramObj[key])}`)
      .join('&');
  }
  _buildRequestObject(route,params = {},method = SplitCloud.methods.GET,cancelToken,timeout){
    let urlParams = method === SplitCloud.methods.GET && Object.keys(params).length ?
       '?' + this._toQueryString(params) : '';
    
    let reqObj = {
      method : method ,
      url : `http://${this.endpoint}/${route}${urlParams}`,
      timeout : timeout || this.timeout,
      cancelToken
    };
    if (method !== SplitCloud.methods.GET) {
      reqObj.data = params;
    }
    return reqObj;
  }
  _extractCancelToken(opts){
    opts = {...opts};
    if(typeof opts != 'object' || !('cancelToken' in opts) ){
      return [undefined,opts];
    }
    let cancelToken;
    if(typeof opts == 'object' && opts.cancelToken){
      cancelToken = opts.cancelToken;
      delete opts.cancelToken;
    }
    return [cancelToken,opts];
  }
  
  getWeeklyPopular(opts){
    let [cancelToken,queryOpts] = this._extractCancelToken(opts);
    return this.request('charts/weekly_popular.json', queryOpts, SplitCloud.methods.GET, cancelToken).then(resp => {
      return toArray(resp.data)
        .map(this.scApi.normalizeStreamUrlProperty)
        .map(this.scApi.transformTrackPayload);
    });
  }

  getWeeklyTrending(opts){
    let [cancelToken,queryOpts] = this._extractCancelToken(opts);
    return this.request('charts/weekly_trending.json', queryOpts, SplitCloud.methods.GET, cancelToken).then(resp => {
      return toArray(resp.data)
        .map(this.scApi.normalizeStreamUrlProperty)
        .map(this.scApi.transformTrackPayload);
    });
  }
  getApplicationConfig(opts){
    let [cancelToken, queryOpts] = this._extractCancelToken(opts);
    return this.request('app/app_config.json', {rd: parseInt(Math.random()*1e3)}, SplitCloud.methods.GET, cancelToken)
      .then(resp => resp.data);
  }
  //TODO 
  getDiscoveryPlaylists(opts){
    let [cancelToken, queryOpts] = this._extractCancelToken(opts);
    return this.request('app/api/discovery.json', queryOpts ,SplitCloud.methods.GET, cancelToken)
      .then(resp => resp.data.collection
        .map( payload => this.scApi.transformSelectionPayload(payload))
        .filter(s => !Object.values(SoundCloudApi.selectionChart).includes(s.urn))
      );
  }
}
SplitCloud.methods = {
  GET:'get',
  POST:'post',
}
SplitCloud.chartType = {
  TOP:'top',
  TRENDING:'trending'
}
SplitCloud.selectionChart = {
  TOP:'splitcloud:charts-top',
  TRENDING:'splitcloud:charts-trending'
}
export default SplitCloud;
