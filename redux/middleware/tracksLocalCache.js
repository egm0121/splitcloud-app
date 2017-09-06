import { actionTypes } from '../constants/actions';
import FileDownloadManager from '../../modules/FileDownloadManager';
let trackManager = new FileDownloadManager({extension:'mp3'});

const trackCacheMiddleware = store => {
  return next => {
    return action => {
      let result = next(action);
      if(action.type == actionTypes.ADD_PLAYLIST_ITEM){
        console.info('trackCacheMiddleware: attempt download asset ->', assetUrl);
        let assetUrl = action.track.streamUrl;
        trackManager.hasLocalAsset(assetUrl)
        .then(hasAsset => {
          console.log('has local asset for url',assetUrl);
          return hasAsset ? Promise.resolve({duplicate:true}) :
            trackManager.storeAsset(assetUrl);
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
      return result;
    }
  }
}

export default trackCacheMiddleware;
