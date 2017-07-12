import axios from 'axios';
import CacheDecorator from '../helpers/cacheDecorator';
class SoundCloudApi {

  constructor({endpoints,clientId}){
    this.endpoints = endpoints || {
      v1: 'api.soundcloud.com',
      v2: 'api-v2.soundcloud.com'
    };
    this.clientId = clientId;
    this.timeout = 2*1e3;
    this.getPopularByGenre = CacheDecorator.withCache(
      this.getPopularByGenre.bind(this),
      'getPopularByGenre',
      3600*1e3 //cache for an hour
    );
  }
  _toQueryString(paramObj){
    return Object.keys(paramObj)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramObj[key])}`)
      .join('&');
  }
  _buildRequestObject(version,route,params = {},method = SoundCloudApi.methods.GET,cancelToken,body){
    let urlParams = this._toQueryString(params);
    return {
      method : method ,
      url : `http://${this.endpoints[version]}/${route}?client_id=${this.clientId}&${urlParams}`,
      timeout : this.timeout,
      cancelToken
    }
  }
  request(...args){
    let requestObj = this._buildRequestObject(...args);
    console.log(requestObj);
    return axios(requestObj);
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
  searchPublic(terms, opts = {}){
    let [cancelToken,queryOpts] = this._extractCancelToken(opts);
    return this.request(SoundCloudApi.api.v1,'tracks',{
      limit:100,
      offset:0,
      streamable:true,
      q : terms,
      ...queryOpts
    }, SoundCloudApi.methods.GET ,cancelToken);
  }
  getPopularByGenre(genre = SoundCloudApi.genre.ALL, opts = {} ){
    let [cancelToken,queryOpts] = this._extractCancelToken(opts);
    return this.request(SoundCloudApi.api.v2,'charts',{
      limit:50,
      offset:0,
      streamable:true,
      high_tier_only:false,
      kind:'top',
      genre,
      ...queryOpts
    },SoundCloudApi.methods.GET,cancelToken);
  }
}
SoundCloudApi.api  = {
  v1 :'v1',
  v2 :'v2'
}
SoundCloudApi.genre = {
  ALL : 'soundcloud%3Agenres%3Aall-music'
}
SoundCloudApi.methods = {
  GET:'get',
  POST:'post',
  PUT:'put',
  DELETE: 'delete'
}
export default SoundCloudApi;
