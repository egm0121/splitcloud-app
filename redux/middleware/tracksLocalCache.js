import { actionTypes } from '../constants/actions';
import FileDownloadManager from '../../modules/FileDownloadManager';
let trackManager = new FileDownloadManager({extension:'mp3'});

trackManager.initCacheDir().then(
  () => trackManager.cleanupIncompleteDownloads()
);

const findTrackInAnyPlaylist = (playlistArr,track) => {
  return playlistArr.filter( playlist => {
    return playlist.tracks.find( curr => curr.id == track.id )
  });
}
const storeLocalTrack = (track) => {
  let assetUrl = track.streamUrl, assetId = track.id;
  console.info('trackCacheMiddleware: attempt download asset ->', assetUrl);
  trackManager.hasLocalAsset(assetId)
  .then(hasAsset => {
    console.log('has local asset for url',assetUrl);
    return hasAsset ? Promise.resolve({duplicate:true}) :
      trackManager.storeAsset(assetUrl,assetId);
  })
  .then((resp) =>{
    if(resp.duplicate){
      console.info('asset already cached');
    } else {
      console.info('asset downloaded successfully',resp);
    }
  }).catch((err) =>{
    console.info('download failed with error',err);
  });

}
const deleteLocalAsset = (track,store) =>{
  if(findTrackInAnyPlaylist(store.getState().playlist,track).length) return false;
  console.info('trackCacheMiddleware: remove local asset:',track);
  return trackManager.deleteLocalAssetPath(track.id);
}
const trackCacheMiddleware = store => {
  return next => {
    return action => {
      //pre action disptach middleware logic
      let prevPlaylistTracks;
      if(action.type == actionTypes.SET_PLAYLIST &&
       action.tracks.length == 0){
        console.info('get the deletable tracks assets')
        prevPlaylistTracks = store.getState().playlist
        .find(curr => curr.side == action.side).tracks;
        prevPlaylistTracks = JSON.parse(JSON.stringify(prevPlaylistTracks));//deep copy
      }
      // dispatch next action middleware and reducers for action
      let result = next(action);
      //post action disptach middleware logic
      if(action.type == actionTypes.ADD_PLAYLIST_ITEM){
        storeLocalTrack(action.track);
      }
      if(action.type == actionTypes.REMOVE_PLAYLIST_ITEM){
        deleteLocalAsset(action.track,store);
      }
      if(action.type == actionTypes.SET_PLAYLIST &&
       action.tracks.length == 0){
        let allDeleted = prevPlaylistTracks.map(
          (track) => deleteLocalAsset(track,store));
        Promise.all(allDeleted).then(() => console.info('deleted all track assets'))
      }
      if([
        actionTypes.CHANGE_CURR_PLAY_INDEX,
        actionTypes.INCREMENT_CURR_PLAY_INDEX,
        actionTypes.DECREMENT_CURR_PLAY_INDEX].includes(action.type)
      ){
        let currPlaylist = store.getState().playlist
            .find(curr => curr.side == action.side);
        let currPlayingTrack = currPlaylist.tracks[currPlaylist.currentTrackIndex];
        console.info('new currently playing track, attempt download');
        storeLocalTrack(currPlayingTrack);
      }
      return result;
    }
  }
}

export default trackCacheMiddleware;
