import CacheDecorator from '../helpers/cacheDecorator';
import iTunes from 'react-native-itunes';

class MediaLibraryApi {
  
  constructor(){
    this.api = iTunes;
    this.transformTrackPayload = this.transformTrackPayload.bind(this);
    this.transformAlbumPayload = this.transformAlbumPayload.bind(this);
    this.initializeCacheDecorators();
  }
  initializeCacheDecorators(){
    this.getAllTracks = CacheDecorator.withCache(
      this.getAllTracks.bind(this),'getAllTracks'
    );
    this.getArtistList = CacheDecorator.withCache(
      this.getArtistList.bind(this),'getArtistList'
    );
    this.getAlbumList = CacheDecorator.withCache(
      this.getAlbumList.bind(this),'getAlbumList'
    );
  }
  getAllTracks(){
    return this.api.getTracks({fields:this.TRACK_FIELDS}).then((tracks) => {
      return tracks.filter(this.isDeviceTrack).map(this.transformTrackPayload);
    });
  }
  getArtworkForTrack(track){
    //return
  }
  getAllPlaylist(){
    return this.getAllTracks().then(tracks => ({
      type: 'playlist',
      isAlbum: false,
      id: 'local_all',
      label : 'All Local Music',
      username: 'Media Library',
      tracks
    }));
  }
  getArtistList(){
    return this.api.getArtists().then((artistList) => { 
      return artistList.map( (name,i) => ({
        username: '',
        label: name,
        type: 'playlist',
        isAlbum: false,
        duration:0,
        id:'local_artist_'+i
      }));
    });
  }
  getAlbumList(){
    return this.api.getAlbums().then((albumList) => {
      return albumList.map(this.transformAlbumPayload);
    })
  }
  getArtist(artistName){
    return this.getAllTracks().then(tracks => {
      return tracks.filter(t => t.username == artistName);
    }).then(artistSongs => {
      if(artistSongs.length === 0){
        return {
          ...this.transformAlbumPayload({
            albumTitle : artistName,
            albumArtist : artistName,
          },0,false),
          tracks:[]
        }
      }
      let albumPayload = this.transformAlbumPayload({
        albumTitle : artistName,
        albumArtist : artistSongs[0].username,
      },0,false);
     
      albumPayload.tracks = artistSongs;
      return albumPayload;
    });
  }
  getAlbum(albumTitle){
    return this.getAllTracks().then(tracks => {
      return tracks.filter(t => t.album == albumTitle);
    }).then(albumsSong => {
      if(albumsSong.length === 0){
        return {
          ...this.transformAlbumPayload({
            albumTitle : albumTitle,
          },0,false),
          tracks:[]
        }
      }
      let albumPayload = this.transformAlbumPayload({
        albumTitle : albumsSong[0].album,
        albumArtist : albumsSong[0].username,
      },0);
      albumPayload.tracks = albumsSong;
      return albumPayload;
    });
  }
  isDeviceTrack(t){
    return t.isCloudItem === false;
  }
  transformAlbumPayload(t,i,isAlbum = true){
    let tracks = undefined;
    if(t.tracks){
      tracks = t.tracks.map(this.transformTrackPayload);
    }
    return {
      type: 'playlist',
      isAlbum: isAlbum,
      id: 'local_album_'+i,
      label : t.albumTitle,
      username: t.albumArtist,
      artwork : t.artwork,
      duration: 0,
      tracks
    };
  }
  transformTrackPayload(t,i){
    return {
      id: 'local'+i,
      type: 'track',
      label : t.title,
      username: t.albumArtist,
      streamUrl : t.assetUrl,
      //artwork : t.artwork, works but needs performance optimization 
      //+ base64 payload should be cached outside of the redux store
      scUploaderLink : null,
      duration: t.duration * 1e3,
      album: t.albumTitle,
      // playbackCount: t.playCount,
      provider : 'library'
    };
  }
  resolvePlayableTrackItem(trackObj){
    return trackObj;
  }
}
MediaLibraryApi.TRACK_FIELDS = MediaLibraryApi.prototype.TRACK_FIELDS = [
  'title',
  'albumArtist',
  'albumTitle',
  'assetUrl',
  'isCloudItem',
//  'artwork', disable artwork for now for performance reasons
  'duration',
  'playCount'
];

export default MediaLibraryApi;
