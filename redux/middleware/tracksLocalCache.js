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
const trackCacheMiddleware = store => {
  return next => {
    return action => {
      let result = next(action);
      if(action.type == actionTypes.ADD_PLAYLIST_ITEM){
        console.info('trackCacheMiddleware: attempt download asset ->', assetUrl);
        let assetUrl = action.track.streamUrl;
        let assetId = action.track.id;
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
      if(action.type == actionTypes.REMOVE_PLAYLIST_ITEM){
        if(findTrackInAnyPlaylist(
          store.getState().playlist,
          action.track).length
        ) return false;
        console.info('trackCacheMiddleware: remove local asset');
        trackManager.deleteLocalAssetPath(action.track.id);
      }
      return result;
    }
  }
}

export default trackCacheMiddleware;
