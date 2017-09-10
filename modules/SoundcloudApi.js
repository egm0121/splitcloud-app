import axios from 'axios';
import CacheDecorator from '../helpers/cacheDecorator';
import {stripSSL } from '../helpers/utils';
class SoundCloudApi {

  constructor({endpoints,clientId}){
    this.endpoints = endpoints || {
      v1: 'api.soundcloud.com',
      v2: 'api-v2.soundcloud.com'
    };
    this.clientId = clientId;
    this.timeout = 2*1e3;

    this.initializeCacheDecorators();
  }
  initializeCacheDecorators(){
    this.getPopularByGenre = CacheDecorator.withCache(
      this.getPopularByGenre.bind(this),
      'getPopularByGenre',
      3600*1e3 //cache for an hour
    );
  }
  request(...args){
    let requestObj = this._buildRequestObject(...args);
    return axios(requestObj);
  }
  _toQueryString(paramObj){
    return Object.keys(paramObj)
      .filter((key) => paramObj[key] != undefined)
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
  getPopularByGenre(genre = SoundCloudApi.genre.ALL, region = SoundCloudApi.region.WORLDWIDE, opts = {} ){
    let [cancelToken,queryOpts] = this._extractCancelToken(opts);
    let regionParam = region != SoundCloudApi.region.WORLDWIDE ? region : undefined;
    return this.request(SoundCloudApi.api.v2,'charts',{
      limit:50,
      offset:0,
      streamable:true,
      high_tier_only:false,
      kind:'top',
      genre,
      region:regionParam,
      ...queryOpts
    },SoundCloudApi.methods.GET,cancelToken);
  }
  getClientId(){
    return this.clientId;
  }
  resolvePlayableTrackItem(trackObj){
    //this strip of https is needed as the ATS excaption for tls version on
    //the info.plist wont work on twice for same request and 302 redirect
    //to a second exceptional domain
    return Object.assign({},trackObj,{
      streamUrl : stripSSL(trackObj.streamUrl) +
        '?client_id='+this.getClientId(),
      artwork : stripSSL(trackObj.artwork)
    });
  }
}
SoundCloudApi.api  = {
  v1 :'v1',
  v2 :'v2'
}
SoundCloudApi.genre = {
  ALL : 'soundcloud:genres:all-music',
  ALTERNATIVE_ROCK : 'soundcloud:genres:alternativerock',
  AMBIENT : 'soundcloud:genres:ambient',
  CLASSICAL : 'soundcloud:genres:classical',
  COUNTRY : 'soundcloud:genres:country',
  DANCE_EDM: 'soundcloud:genres:danceedm',
  DANCEHALL : 'soundcloud:genres:dancehall',
  DEEP_HOUSE : 'soundcloud:genres:deephouse',
  DISCO : 'soundcloud:genres:disco',
  DRUM_AND_BASS: 'soundcloud:genres:drumbass',
  DUBSTEP: 'soundcloud:genres:dubstep',
  ELECTRONIC :'soundcloud:genres:electronic',
  SONG_WRITER:'soundcloud:genres:folksingersongwriter',
  HIP_HOP : 'soundcloud:genres:hiphoprap',
  HOUSE : 'soundcloud:genres:house',
  INDIE : 'soundcloud:genres:indie',
  JAZZ_AND_BLUES : 'soundcloud:genres:jazzblues',
  LATIN : 'soundcloud:genres:latin',
  METAL : 'soundcloud:genres:metal',
  PIANO : 'soundcloud:genres:piano',
  POP : 'soundcloud:genres:pop',
  RNB_AND_SOUL : 'soundcloud:genres:rbsoul',
  RAGGAE : 'soundcloud:genres:reggae',
  REGGAETON : 'soundcloud:genres:reggaeton',
  ROCK : 'soundcloud:genres:rock',
  SOUNDTRACK : 'soundcloud:genres:soundtrack',
  TECHNO: 'soundcloud:genres:techno',
  TRANCE : 'soundcloud:genres:trance',
  TRAP : 'soundcloud:genres:trap',
  TRIP_HOP: 'soundcloud:genres:triphop',
  WORLD : 'soundcloud:genres:world',
  AUDIOBOOKS : 'soundcloud:genres:audiobooks',
  BUSINESS : 'soundcloud:genres:business',
  COMEDY : 'soundcloud:genres:comedy',

  ENTERTAINMENT : 'soundcloud:genres:entertainment',
  LEARNING : 'soundcloud:genres:learning',
  POLITICS : 'soundcloud:genres:newspolitics',
  RELIGION : 'soundcloud:genres:religionspirituality',
  SCIENCE : 'soundcloud:genres:science',
  SPORTS : 'soundcloud:genres:sports',
  STORYTELLING : 'soundcloud:genres:storytelling',
  TECHNOLOGY : 'soundcloud:genres:technology'
};
SoundCloudApi.region = {
  WORLDWIDE : 'all',
  AUSTRALIA : 'soundcloud:regions:AU',
  CANADA : 'soundcloud:regions:CA',
  FRANCE : 'soundcloud:regions:FR',
  GERMANY : 'soundcloud:regions:DE',
  IRELAND : 'soundcloud:regions:IE',
  NETHERLANDS : 'soundcloud:regions:NL',
  NEW_ZELAND : 'soundcloud:regions:NZ',
  UNITED_KINGDOM : 'soundcloud:regions:GB',
  UNITED_STATES : 'soundcloud:regions:US'
}
SoundCloudApi.methods = {
  GET:'get',
  POST:'post',
  PUT:'put',
  DELETE: 'delete'
};
export default SoundCloudApi;
