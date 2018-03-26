import CacheDecorator from '../helpers/cacheDecorator';
import iTunes from 'react-native-itunes';

class MediaLibraryApi {

  constructor(){
    this.api = iTunes;
    this.transformTrackPayload = this.transformTrackPayload.bind(this);
    this.transformPlaylistPayload = this.transformPlaylistPayload.bind(this);
    this.transformSelectionPayload = this.transformSelectionPayload.bind(this);
    this.initializeCacheDecorators();
  }
  initializeCacheDecorators(){
    // this.getPopularByGenre = CacheDecorator.withCache(
    //   this.getPopularByGenre.bind(this),
    //   'getPopularByGenre',
    //   3600*1e3
    // );
  }
  getAllTracks(){
    return this.api.getTracks().then((tracks) => {
      console.log(tracks);
      return tracks;
    });
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
    return trackObj;
  }
}

export default MediaLibraryApi;
