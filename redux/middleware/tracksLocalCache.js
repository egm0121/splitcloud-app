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
const trackCacheMiddleware = store => {
  return next => {
    return action => {
      let result = next(action);
      if(action.type == actionTypes.ADD_PLAYLIST_ITEM){
        storeLocalTrack(action.track);
      }
      if(action.type == actionTypes.REMOVE_PLAYLIST_ITEM){
        if(findTrackInAnyPlaylist(
          store.getState().playlist,
          action.track).length
        ) return false;
        console.info('trackCacheMiddleware: remove local asset');
        trackManager.deleteLocalAssetPath(action.track.id);
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
