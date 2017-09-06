import RNFS from 'react-native-fs';
import md5 from 'js-md5';

class FileDownloadManager{
  constructor(opts){
    this.options = Object.assign({},FileDownloadManager.defaultOptions,opts);
    this.options.cachePath = RNFS.MainBundlePath + '/';
    this.initCacheDir();
    this.downloadQueue = [];
    this.progressItem = null;
  }
  initCacheDir(){
    if(!this.options.cacheNamespace) return false;
    let path = `${RNFS.MainBundlePath}/${this.options.cacheNamespace}/`;
    RNFS.mkdir(path,{NSURLIsExcludedFromBackupKey : true});
    this.options.cachePath = path;
    console.log('FileDownloadManager caching dir is:',path);
  }
  hashUrlToFilename(filename){
    let hash = md5(filename);
    return this.options.extension ? `${hash}.${this.options.extension}`: hash;
  }
  storeAsset(assetUrl){
    return new Promise((res,rej) => {
      let assetHash = this.hashUrlToFilename(assetUrl);
      let downloadItem = {
        fromUrl: assetUrl,
        toFile: this.options.cachePath + assetHash,
        hash: assetHash,
        resolve: res,
        reject: rej
      };
      console.log('push download job in queue');
      this.downloadQueue.push(downloadItem);
      if(!this.progressItem){
        this.processDownloadQueue();
      }
    })
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
      toFile : queueItem.toFile
    });

    this.progressItem = {
      item : queueItem,
      promise : downloadReturn.promise,
      jobId : downloadReturn.jobId
    };

    downloadReturn.promise.then((res) => {
      queueItem.resolve(res);
    })
    .catch((err) => queueItem.reject(err))
    .then(() => {
      this.progressItem = null;
      this.processDownloadQueue();
    })
    return downloadReturn.promise;
  }
  getLocalAssetPath(assetUrl){
    return this.options.cachePath + this.hashUrlToFilename(assetUrl);
  }
  hasLocalAsset(assetUrl){
    return RNFS.exists(this.options.cachePath + this.hashUrlToFilename(assetUrl));
  }
}
FileDownloadManager.defaultOptions = {
  cacheNamespace: 'cache',
  extension: false,
  ttl : false
};

export default FileDownloadManager;
