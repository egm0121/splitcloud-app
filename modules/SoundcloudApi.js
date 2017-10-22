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
    this.transformTrackPayload = this.transformTrackPayload.bind(this);
    this.initializeCacheDecorators();
  }
  initializeCacheDecorators(){
    //fix bug when returning promise not corresponding to complete request payload
    this.getPopularByGenre = CacheDecorator.withCache(
      this.getPopularByGenre.bind(this),
      'getPopularByGenre',
      3600*1e3
    );
    this.resolveScResource = CacheDecorator.withCache(
      this.resolveScResource.bind(this),
      'resolveScResource',
      3600*1e3
    );
    this.getTracksByUploaderLink = CacheDecorator.withCache(
      this.getTracksByUploaderLink.bind(this),
      'getTracksByUploaderLink',
      3600*1e3
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
    }, SoundCloudApi.methods.GET ,cancelToken).then(resp => {
      console.log(resp.data);
      return resp.data
        .map(this.normalizeStreamUrlProperty)
        .map(this.transformTrackPayload);
    });
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
    },SoundCloudApi.methods.GET,cancelToken)
    .then(resp => {
      let retValue = resp.data.collection
        .map(t => t.track)
        .map(this.normalizeStreamUrlProperty)
        .map(this.transformTrackPayload);
      return retValue;
    });
  }
  resolveScResource(scResourceUrl){
    return this.request(SoundCloudApi.api.v1,'resolve',{
      url:scResourceUrl
    });
  }
  getScUserProfile(scUserId){
    return this.request(SoundCloudApi.api.v1,`users/${scUserId}`);
  }
  getScUserProfileTracks(scUserId){
    return this.request(SoundCloudApi.api.v1,`users/${scUserId}/tracks`)
    .then(resp => {
      return resp.data
        .map(this.normalizeStreamUrlProperty)
        .map(this.transformTrackPayload);
    });
  }
  getTracksByUploaderLink(scUploaderLink){
    return this.resolveScResource(scUploaderLink).then(resp => {
      return this.getScUserProfileTracks(resp.data.id);
    });
  }
  getClientId(){
    return this.clientId;
  }
  normalizeStreamUrlProperty(trackObj){
    if(trackObj.stream_url)return trackObj;
    trackObj.stream_url = trackObj.uri + '/stream'
    return trackObj;
  }
  transformTrackPayload(t){
    return this.resolvePlayableTrackItem(
      {
        id: t.id,
        label : t.title,
        username: t.user.username,
        streamUrl : t.stream_url,
        artwork : t.artwork_url,
        scUploaderLink : t.user.permalink_url,
        duration: t.duration,
        playbackCount: t.playback_count
      });
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
