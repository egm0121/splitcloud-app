import RNFS from 'react-native-fs';
import md5 from 'js-md5';

class FileDownloadManager{
  constructor(opts){
    this.options = Object.assign({},FileDownloadManager.defaultOptions,opts);
    this.options.cachePath = RNFS.DocumentDirectoryPath + '/' + this.options.cacheNamespace + '/';
    this.downloadQueue = [];
    this.progressItem = null;
    this.isCacheFolderInit = false;
  }
  initCacheDir(){
    if(this.isCacheFolderInit) return Promise.resolve(true);
    return RNFS.mkdir(this.options.cachePath,{NSURLIsExcludedFromBackupKey : true})
    .then(() => {
      console.log('FileDownloadManager caching dir init:',this.options.cachePath);
      this.isCacheFolderInit = true;
    });
  }
  hashUrlToFilename(filename){
    let hash = md5(filename.toString());
    return this.options.extension ? `${hash}.${this.options.extension}`: hash;
  }
  storeAsset(assetUrl,assetId){
    return this.initCacheDir().then(() =>{
      return new Promise((res,rej) => {
        let assetHash = this.hashUrlToFilename(assetId ? assetId : assetUrl);
        let downloadItem = {
          fromUrl: assetUrl,
          toFile: this.options.cachePath + assetHash,
          hash: assetHash,
          resolve: res,
          reject: rej
        };
        console.log('push download job in queue');
        if((this.progressItem &&
            this.progressItem.item.hash == downloadItem.hash) ||
            this.downloadQueue.find((curr) => curr.hash == downloadItem.hash )){
          console.log('skip download as already queued');
          return false;
        }
        this.downloadQueue.push(downloadItem);
        if(!this.progressItem){
          this.processDownloadQueue();
        }
      })
    });
  }
  processDownloadQueue(){
    let queueItem = this.downloadQueue.pop();
    if(!queueItem){
      console.log('no more queued downloads');
      return false;
    }
    console.log('processDownloadQueue item', queueItem);
    let downloadReturn = RNFS.downloadFile({
      fromUrl : queueItem.fromUrl,
      toFile : queueItem.toFile + this.options.tempStorageExtension
    });

    this.progressItem = {
      item : queueItem,
      promise : downloadReturn.promise,
      jobId : downloadReturn.jobId
    };

    downloadReturn.promise.then((res) => {
      RNFS.moveFile(
        queueItem.toFile + this.options.tempStorageExtension,
        queueItem.toFile
      ).then(move => queueItem.resolve(res));
    })
    .catch((err) => {
      queueItem.reject(err);
      //use last then block as finally
      return Promise.resolve();
    })
    .then(() => {
      this.progressItem = null;
      this.processDownloadQueue();
    })
    return downloadReturn.promise;
  }
  getLocalAssetPath(assetId){
    return this.options.cachePath + this.hashUrlToFilename(assetId);
  }
  hasLocalAsset(assetId){
    return RNFS.exists(this.options.cachePath + this.hashUrlToFilename(assetId));
  }
  deleteLocalAssetPath(assetId){
    return this.hasLocalAsset(assetId).then((hasAsset) => {
      if(hasAsset){
        return RNFS.unlink(this.getLocalAssetPath(assetId));
      }
    })
  }
  deleteAllStorage(){
    return RNFS.unlink(this.options.cachePath);
  }
}
FileDownloadManager.defaultOptions = {
  cacheNamespace: 'cache',
  extension: false,
  tempStorageExtension:'.download',
  ttl : false
};

export default FileDownloadManager;
