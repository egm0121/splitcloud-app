import axios from 'axios';
import CacheDecorator from '../helpers/cacheDecorator';
import { stripSSL, toArray } from '../helpers/utils';
import { Linking } from 'react-native';
import querystring from 'query-string';
import { SC_STREAM_TOKEN_HIT, ANALYTICS_CATEGORY } from '../helpers/constants';
import AnalyticsService from '../modules/Analytics';

let activeStreamToken;

export const updateActiveStreamToken = newClientToken => {
  activeStreamToken = newClientToken;
};

class SoundCloudApi {

  constructor({endpoints,clientId,authClientId,redirectUri,clientSecret}){
    this.endpoints = endpoints || {
      v1: 'api.soundcloud.com',
      v2: 'api-v2.soundcloud.com'
    };
    this.clientId = clientId;
    this.authClientId = authClientId || clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    
    this.timeout = 4*1e3;
    this.extendedTimeout = 10*1e3;
    this.transformTrackPayload = this.transformTrackPayload.bind(this);
    this.transformPlaylistPayload = this.transformPlaylistPayload.bind(this);
    this.transformSelectionPayload = this.transformSelectionPayload.bind(this);
    this.handleAuthCode = this.handleAuthCode.bind(this);
    
    this.initializeCacheDecorators();
  }
  getClientId(){
    return activeStreamToken || this.clientId;
  }
  initializeCacheDecorators(){

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
    this.getScUserProfileTracks = CacheDecorator.withCache(
      this.getScUserProfileTracks.bind(this),
      'getScUserProfileTracks',
      600*1e3
    );
    this.getScUserPlaylists = CacheDecorator.withCache(
      this.getScUserPlaylists.bind(this),
      'getScUserPlaylists',
      600*1e3
    );
    this.getSoundcloudSelections = CacheDecorator.withCache(
      this.getSoundcloudSelections.bind(this),
      'getSoundcloudSelections',
      3600*1e3
    );
    this.getRelatedTracks = CacheDecorator.withCache(
      this.getRelatedTracks.bind(this),
      'getRelatedTracks',
      3600*1e3
    )
  }
  request(...args){
    let requestObj = this._buildRequestObject(...args);
    console.log('sc api request object',requestObj);
    return axios(requestObj);
  }
  _toQueryString(paramObj){
    return Object.keys(paramObj)
      .filter((key) => paramObj[key] != undefined)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramObj[key])}`)
      .join('&');
  }
  _buildRequestObject(version,route,params = {},method = SoundCloudApi.methods.GET,cancelToken,timeout,overrideClientId){
    let urlParams = method === SoundCloudApi.methods.GET ?
       '&' + this._toQueryString(params) : '';
    let secure =  method === SoundCloudApi.methods.GET ? '' : 's';
    let accessToken = this.accessToken ? `&oauth_token=${this.accessToken}` :'';
    let reqObj = {
      method : method ,
      url : `http${secure}://${this.endpoints[version]}/${route}?client_id=${overrideClientId||this.getClientId()}${accessToken}${urlParams}`,
      timeout : timeout || this.timeout,
      cancelToken
    };
    if (method !== SoundCloudApi.methods.GET) {
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
  subscribeProtocolCallback(cb){
    Linking.addEventListener('url', cb);
  }
  unsubscribeProtocolCallback(cb){
    Linking.removeEventListener('url', cb);
  }
  handleAuthCode({url}){
    let fragment = url.split('#')[1];
    if (fragment) {
      let params = querystring.parse(fragment);
      this.accessToken = params.access_token;
      return this.accessToken;
    }
    return false;
  }
  authenticate(){
    return new Promise((res, rej) => {
      if(this.accessToken) res(this.accessToken);
      let onAuthCallback = (args)  => {
        let authorized = this.handleAuthCode(args);
        authorized ? res(authorized) : rej(new Error('auth failed'));
        this.unsubscribeProtocolCallback(onAuthCallback);
      };
      this.subscribeProtocolCallback(onAuthCallback);
      const connectUrl = [
        'https://soundcloud.com/connect',
        '?response_type=token',
        '&scope=non-expiring',
        '&client_id=' + this.authClientId,
        '&display=popup',
        '&redirect_uri=' + this.redirectUri,
        '&state=testing'
      ].join('');
      Linking.openURL(connectUrl);
      console.log('opening auth url for soundcloud', connectUrl);
    });
  }
  getAccessToken(code){
    return this.request(SoundCloudApi.api.v1,'oauth2/token',{      
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
      code
    },SoundCloudApi.methods.POST,undefined,undefined,this.authClientId);
  }
  getOwnPlaylists(){
    return this.request(SoundCloudApi.api.v1,'me/playlists').then(resp => {
      return resp.data.filter( p => p.streamable)
        .map(this.transformPlaylistPayload)
        .filter( p => p.tracks.length);
    });
  }
  deleteUserPlaylist(playlistId){
    return this.request(SoundCloudApi.api.v1,`playlists/${playlistId}`,
      undefined,SoundCloudApi.methods.DELETE);
  }
  createPlaylist(playlistName, tracksArray, sharing = 'public'){
    let prom = this.request(SoundCloudApi.api.v2,'playlists',{
      playlist: {
        sharing,
        title: playlistName,
        tracks: tracksArray
      }
    },SoundCloudApi.methods.POST);
    prom.then(() => CacheDecorator.delCache('getScUserPlaylists'))
    return prom;
  }
  updatePlaylist(playlistId, tracksArray){
    let prom = this.request(SoundCloudApi.api.v2,`playlists/${playlistId}`,{
      playlist: {
        tracks: tracksArray
      }
    },SoundCloudApi.methods.PUT);
    prom.then(() => CacheDecorator.delCache('getScUserPlaylists'))
    return prom;
  }
  searchPublicTracks(terms,limit=100,offset=0,opts = {}){
    let [cancelToken,queryOpts] = this._extractCancelToken(opts);
    return this.request(SoundCloudApi.api.v1,'tracks',{
      limit,
      offset,
      streamable:true,
      q : terms,
      ...queryOpts
    }, SoundCloudApi.methods.GET ,cancelToken).then(resp => {
      return resp.data
        .map(this.normalizeStreamUrlProperty)
        .map(this.transformTrackPayload);
    });
  }
  searchUsers(terms,limit=5,offset=0,opts ={}){
    let [cancelToken,queryOpts] = this._extractCancelToken(opts);
    return this.request(SoundCloudApi.api.v1,'users',{
      limit,
      offset,
      q : terms,
      ...queryOpts
    }, SoundCloudApi.methods.GET ,cancelToken).then(resp => {
      return toArray(resp.data).map(this.transformUserPayload);
    });
  }
  getPopularByGenre(chartType = SoundCloudApi.chartType.TOP , genre = SoundCloudApi.genre.ALL, region = SoundCloudApi.region.WORLDWIDE, opts = {} ){
    let [cancelToken,queryOpts] = this._extractCancelToken(opts);
    let regionParam = region != SoundCloudApi.region.WORLDWIDE ? region : undefined;
    return this.request(SoundCloudApi.api.v2,'charts',{
      limit:50,
      offset:0,
      streamable:true,
      high_tier_only:false,
      kind:chartType,
      genre,
      region:regionParam,
      ...queryOpts
    },SoundCloudApi.methods.GET,cancelToken)
    .then(resp => {
      if(!resp.data || !resp.data.collection || !Array.isArray(resp.data.collection)){
        throw new Error('getPopularByGenre invalid data.collection received');
      }
      let retValue = resp.data.collection
        .map(t => t.track)
        .map(this.normalizeStreamUrlProperty)
        .map(this.transformTrackPayload);
      return retValue;
    });
  }
  getSoundcloudSelections(opts ={}){
    let [cancelToken,queryOpts] = this._extractCancelToken(opts);
    return this.request(SoundCloudApi.api.v2,'selections',{
      limit:5,
      offset:0,
      ...queryOpts
    },SoundCloudApi.methods.GET,cancelToken)
    .then(resp => {
      if(!Array.isArray(resp.data.collection)) {
        throw new Error('empty sc selection response payload');
      }
      let retValue = resp.data.collection
        .map(this.transformSelectionPayload)
        .filter(s => !Object.values(SoundCloudApi.selectionChart).includes(s.urn) );
      return retValue;
    });
  }
  resolveScResource(scResourceUrl){
    return this.request(SoundCloudApi.api.v1,'resolve',{
      url:scResourceUrl
    });
  }
  isScResource(val){
    return typeof val  == 'string' && val.indexOf('//soundcloud.com') > -1;
  }
  resolveResourceId(scIdOrUrl){
    return this.isScResource(scIdOrUrl) ?
      this.resolveScResource(scIdOrUrl):
    Promise.resolve({data:{id:scIdOrUrl}});
  }
  getScUserProfile(scIdOrUrl){
    return this.resolveResourceId(scIdOrUrl).then((resp) => {
      return this.request(SoundCloudApi.api.v1,`users/${resp.data.id}`)
    }).then(resp=>{
      return this.transformUserPayload(resp.data);
    });
  }
  getScUserProfileTracks(scIdOrUrl){
    return this.resolveResourceId(scIdOrUrl).then((resp) => {
      return this.request(SoundCloudApi.api.v1,`users/${resp.data.id}/tracks`)
    }).then(resp => {
      return toArray(resp.data)
        .map(this.normalizeStreamUrlProperty)
        .map(this.transformTrackPayload);
    });
  }
  getScUserProfileFavorites(scIdOrUrl){
    return this.resolveResourceId(scIdOrUrl).then((resp) => {
      return this.request(SoundCloudApi.api.v1,`users/${resp.data.id}/favorites`)
    }).then(resp => {
      return toArray(resp.data)
        .map(this.normalizeStreamUrlProperty)
        .map(this.transformTrackPayload);
    });
  }
  getScUserPlaylists(scIdOrUrl){
    return this.resolveResourceId(scIdOrUrl).then((resp) => {
      return this.request(SoundCloudApi.api.v1,`users/${resp.data.id}/playlists`,
              undefined,undefined,undefined,this.extendedTimeout);
    }).then(resp => {
      return toArray(resp.data).filter(p => p.streamable)
        .map(this.transformPlaylistPayload)
        .filter(p => p.tracks.length);
    });
  }
  getScPlaylist(scId){
    return this.request(SoundCloudApi.api.v1,`playlists/${scId}`,
        undefined,undefined,undefined,this.extendedTimeout)
      .then((resp) => {
        return this.transformPlaylistPayload(resp.data);
      })
  }
  getRelatedTracks(scTrackId){
    return this.request(SoundCloudApi.api.v1,`tracks/${scTrackId}/related`)
    .then(resp => {
      return this.transformPlaylistPayload(
        this.tracklistToPlaylist(resp.data,`rel_${scTrackId}`)
      );
    })
  }
  normalizeStreamUrlProperty(trackObj){
    if(trackObj.stream_url)return trackObj;
    trackObj.stream_url = trackObj.uri + '/stream'
    return trackObj;
  }
  transformSelectionPayload(selection){
    return {
      urn : selection.urn,
      label : selection.title,
      description : selection.description,
      playlists: toArray(selection.playlists).map(this.transformPlaylistPayload)
    };
  }
  tracklistToPlaylist(data,id){
    return {
      id,
      track_count: data.length,
      user: { username: '' },
      title: 'Related Tracks',
      tracks: data
    };
  }
  transformPlaylistPayload(t){
    let tracks = undefined;
    let artwork = t.artwork_url;
    if(t.tracks){
      tracks = t.tracks.map(this.normalizeStreamUrlProperty)
        .map(this.transformTrackPayload);
      if(!artwork && tracks[0]) artwork = tracks[0].artwork;
    }
    return {
      type: 'playlist',
      id: t.id,
      label : t.title,
      username: t.user.username,
      artwork : artwork,
      duration : t.duration,
      trackCount: t.track_count,
      tracks
    };
  }
  transformTrackPayload(t){
    return {
      id: t.id,
      type: 'track',
      label : t.title,
      username: t.user.username,
      streamUrl : t.stream_url,
      artwork : stripSSL(t.artwork_url),
      scUploaderLink : t.user.permalink_url,
      duration: t.duration,
      playbackCount: t.playback_count,
      provider : 'soundcloud'
    };
  }
  transformUserPayload(user){
    return {
      scUploaderLink:user.permalink_url,
      id:user.id,
      type:'user',
      username: user.username,
      firstName : user.first_name,
      lastName: user.last_name,
      city: user.city,
      country: user.country,
      description: user.description,
      followersCount: user.followers_count,
      avatarUrl: user.avatar_url,
      websiteTitle: user.website_title,
      websiteCount: user.website_count,
      likesCount: user.likes_count,
      trackCount: user.track_count
    };
  }
  resolveStreamUrlFromTrackId(id){
    return `https://api.soundcloud.com/tracks/${id}/stream`;
  }
  resolvePlayableStreamForTrackId(trackId){
    AnalyticsService.sendEvent({
      category: ANALYTICS_CATEGORY.SC_API,
      action: SC_STREAM_TOKEN_HIT,
      label: this.getClientId()
    });
    console.log('resolvePlayableStreamForTrackId',this.getClientId());
    return stripSSL(this.resolveStreamUrlFromTrackId(trackId)) + '?client_id=' + this.getClientId(); 
  }
}
SoundCloudApi.api = {
  v1 :'v1',
  v2 :'v2'
}
SoundCloudApi.chartType = {
  TOP:'top',
  TRENDING:'trending'
}
SoundCloudApi.selectionChart = {
  TOP:'soundcloud:selections:charts-top',
  TRENDING:'soundcloud:selections:charts-trending'
}
SoundCloudApi.genre = {
  GLOBAL : 'soundcloud:genres:all-music',
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
