import CacheDecorator from '../helpers/cacheDecorator';
import iTunes from 'react-native-itunes';
import sanitizeFilename from 'sanitize-filename';
import RNFS from 'react-native-fs';
import { APP_ARTWORK_CACHE_FOLDER } from '../helpers/constants';
let assetCacheInitialized = false;
class MediaLibraryApi {
  
  constructor(){
    this.api = iTunes;
    this.transformTrackPayload = this.transformTrackPayload.bind(this);
    this.transformAlbumPayload = this.transformAlbumPayload.bind(this);
    this.cacheArtworkToFile = this.cacheArtworkToFile.bind(this);
    this.createLibraryArtworkCache = this.createLibraryArtworkCache.bind(this);
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
  requestMediaAccess(){
    this.api.getTracks({fields:this.TRACK_FIELDS});
  }
  getAllTracks(){
    return this.api.getTracks({fields:this.TRACK_FIELDS}).then((tracks) => {
      return tracks.filter(this.isDeviceTrack).map(this.transformTrackPayload);
    });
  }
  getArtworkFilenameForTrack(track){
    return sanitizeFilename(track.label + '-' + track.username + '.jpg').replace(' ','_');
  }
  getArtworkForTrack(track){
    return 'file://' + APP_ARTWORK_CACHE_FOLDER + '/' + this.getArtworkFilenameForTrack(track);
  }
  cacheArtworkToFile(album){
    let image = album.artwork.replace(/^data:image\/jpeg;base64,/, '');
    let filename = this.getArtworkFilenameForTrack(album);
    return RNFS.writeFile( APP_ARTWORK_CACHE_FOLDER + '/' + filename , image, 'base64')
      .then(() => {
        let res = {filename, uri: this.getArtworkForTrack(album)};
        return res;
      });
  }
  createLibraryArtworkCache(){
    return RNFS.mkdir(APP_ARTWORK_CACHE_FOLDER,{NSURLIsExcludedFromBackupKey : true})
    .then(() => {
      console.log('MediaLibraryApi asset caching dir :',APP_ARTWORK_CACHE_FOLDER);
    });
  }
  refreshLibraryArtworks(){
    assetCacheInitialized = false;
    this.cacheLibraryArtworks();
  }
  cacheLibraryArtworks(){
    if(assetCacheInitialized) return Promise.reject('cache already initialized');
    return this.createLibraryArtworkCache()
    .then(this.getAlbumList)
    .then((albumList) => {
      assetCacheInitialized = true;
      return Promise.all(albumList.map(this.cacheArtworkToFile))
    })
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
        username: name,
        label: name,
        type: 'playlist',
        isArtist: true,
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
      const albumTracks = tracks.filter(t => t.album == albumTitle)
      .sort((a,b) => a.trackNumber -  b.trackNumber );
      return albumTracks;
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
    return t.isCloudItem === false && t.assetUrl;
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
      artwork : this.getArtworkFilenameForTrack({
        label : t.albumTitle,
        username: t.albumArtist,
      }), 
      scUploaderLink : null,
      duration: t.duration * 1e3,
      album: t.albumTitle,
      trackNumber: t.albumTrackNumber,
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
  'albumTrackNumber',
  'assetUrl',
  'isCloudItem',
  'duration',
  'playCount'
];
let requestLibAcces = false;
if(!requestLibAcces){
  console.log('requesting media access');
  //call an api just to ask for confirmation to access lib on first start
  (new MediaLibraryApi).requestMediaAccess();
  requestLibAcces = true;
}

export default MediaLibraryApi;
