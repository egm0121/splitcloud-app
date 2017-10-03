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
    if(!assetId && !assetId) return Promise.reject(new Error('Invalid Input'));
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
          rej(new Error('skip download as already queued'));
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
    let queueItem = this.downloadQueue.pop(),connectionTimeout;
    if(!queueItem){
      console.log('no more queued downloads');
      return false;
    }

    connectionTimeout = setTimeout(() => {
      console.warn('download timed out: clean progressItem')
      queueItem.reject(new Error('connection Timeout'));
      this.progressItem = null;
    },this.options.downloadBeginTimeout);

    console.log('processDownloadQueue item', queueItem);
    let downloadReturn = RNFS.downloadFile({
      fromUrl : queueItem.fromUrl,
      toFile : queueItem.toFile + this.options.tempStorageExtension,
      begin : (info) => {
        console.log('download started');
        clearTimeout(connectionTimeout);
      }
    });

    this.progressItem = {
      item : queueItem,
      promise : downloadReturn.promise,
      jobId : downloadReturn.jobId
    };

    downloadReturn.promise.then((res) => {
      return RNFS.moveFile(
        queueItem.toFile + this.options.tempStorageExtension,
        queueItem.toFile
      ).then(move => { queueItem.resolve(res); });
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
    if(!assetId) return false;
    return this.options.cachePath + this.hashUrlToFilename(assetId);
  }
  hasLocalAsset(assetId){
    if(!assetId) return Promise.reject(new Error('Invalid Input'));
    return RNFS.exists(this.options.cachePath + this.hashUrlToFilename(assetId));
  }
  deleteLocalAssetPath(assetId){
    return this.hasLocalAsset(assetId).then((hasAsset) => {
      if(hasAsset){
        return RNFS.unlink(this.getLocalAssetPath(assetId));
      }
    })
  }
  _isTempDownloadFile(filename){
    let testExtension = new RegExp(
      (this.options.tempStorageExtension.replace('.','\.'))+'$'
    );
    return testExtension.test(filename);
  }
  cleanupIncompleteDownloads(){

    RNFS.readDir(this.options.cachePath).then((pathsArr) => {
      let deleteAllPaths = pathsArr.filter(
        file => this._isTempDownloadFile(file.name)
      )
      .map(f =>{ console.log('del file'+f.name); return f})
      .map(file => RNFS.unlink(file.path));

      return Promise.all(deleteAllPaths);
    });
  }
  deleteAllStorage(){
    return RNFS.unlink(this.options.cachePath).then(()=>{
      this.isCacheFolderInit = false;
    });
  }
}
FileDownloadManager.defaultOptions = {
  cacheNamespace: 'cache',
  extension: false,
  tempStorageExtension:'.download',
  ttl : false,
  downloadBeginTimeout: 2*1e3
};

export default FileDownloadManager;
