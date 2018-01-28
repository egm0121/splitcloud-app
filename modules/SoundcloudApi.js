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
    this.timeout = 4*1e3;
    this.extendedTimeout = 10*1e3;
    this.transformTrackPayload = this.transformTrackPayload.bind(this);
    this.transformPlaylistPayload = this.transformPlaylistPayload.bind(this);
    this.transformSelectionPayload = this.transformSelectionPayload.bind(this);
    this.initializeCacheDecorators();
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
  _buildRequestObject(version,route,params = {},method = SoundCloudApi.methods.GET,cancelToken,timeout){
    let urlParams = this._toQueryString(params);
    return {
      method : method ,
      url : `http://${this.endpoints[version]}/${route}?client_id=${this.clientId}&${urlParams}`,
      timeout : timeout || this.timeout,
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
      return resp.data.map(this.transformUserPayload);
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
      return resp.data
        .map(this.normalizeStreamUrlProperty)
        .map(this.transformTrackPayload);
    });
  }
  getScUserProfileFavorites(scIdOrUrl){
    return this.resolveResourceId(scIdOrUrl).then((resp) => {
      return this.request(SoundCloudApi.api.v1,`users/${resp.data.id}/favorites`)
    }).then(resp => {
      return resp.data
        .map(this.normalizeStreamUrlProperty)
        .map(this.transformTrackPayload);
    });
  }
  getScUserPlaylists(scIdOrUrl){
    return this.resolveResourceId(scIdOrUrl).then((resp) => {
      return this.request(SoundCloudApi.api.v1,`users/${resp.data.id}/playlists`,
              undefined,undefined,undefined,this.extendedTimeout);
    }).then(resp => {
      let playlistData = resp.data;

      return playlistData.filter( p => p.streamable)
        .map(this.transformPlaylistPayload)
        .filter( p => p.tracks.length);
    });
  }
  getScPlaylist(scId){
    return this.request(SoundCloudApi.api.v1,`playlists/${scId}`,
        undefined,undefined,undefined,this.extendedTimeout)
      .then((resp) => {
        return this.transformPlaylistPayload(resp.data);
      })
  }
  getClientId(){
    return this.clientId;
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
      playlists: (selection.playlists || []).map(this.transformPlaylistPayload)
    };
  }
  transformPlaylistPayload(t){
    let tracks = undefined;
    if(t.tracks){
      tracks = t.tracks.map(this.normalizeStreamUrlProperty)
        .map(this.transformTrackPayload);
    }
    return {
      type: 'playlist',
      id: t.id,
      label : t.title,
      username: t.user.username,
      artwork : t.artwork_url,
      duration : t.duration,
      trackCount: t.track_count,
      tracks
    };
  }
  transformTrackPayload(t){
    return this.resolvePlayableTrackItem(
      {
        id: t.id,
        type: 'track',
        label : t.title,
        username: t.user.username,
        streamUrl : t.stream_url,
        artwork : t.artwork_url,
        scUploaderLink : t.user.permalink_url,
        duration: t.duration,
        playbackCount: t.playback_count
      });
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
