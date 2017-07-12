
export function CacheDecorator() {
  var that = this;
  this.fnCache = {};
  this.timeoutRef = {};
  this.uniqFuncId = 0;
  /* private helpers */
  var isObject = (value) => value !== null && typeof value === 'object';
  var copy = (v) => JSON.parse(JSON.stringify(v));
  var getUniqCacheId = function(){
    return 'int-id-'+(that.uniqFuncId++);
  };
  var isPromiseLike = (prom) => {
    return prom && isObject(prom) && 'then' in prom;
  };
  var rewrapPromise = function(prom){

    if( isPromiseLike(prom) ){
      return new Promise((res,rej) => {
        prom.then(function(resp){
          var originalPayload = resp.data;
          var cloned = copy(originalPayload);
          resp.data = cloned;
          res(resp);
        }).catch((err) => {
          rej(err);
        });
      });
    }

    if( isObject(prom) ){
      return copy(prom);
    }
      //if it's simple value
    return prom;
  };
  var argsSerializer = function(e){
    if(e === undefined || e === null ) return 'null';

    return isObject(e) ? JSON.stringify(e) : e.toString();
  };
  var startsWith = function(ns){
    return function(i){
      return ns.indexOf(i) === 0;
    }
  };
  var findBy = function(ns){
    return function(i){
      return ns === i;
    }
  };
  var not = function(fn){
    return function(){
      var a = [].slice.call(arguments,0);
      return !fn.apply(false,a);
    };
  };

  this.getInternalCache = function(){
    return this.fnCache;
  }

  this.setInternalCache = function(arrStorage){
    return this.fnCache = arrStorage;
  }

  this.getCache = function(key){
    var prefix = key.split('-')[0];
    return key in  this.fnCache ?  this.fnCache[key] : false;
  };

  this.setCache = function(key,val,timeout = 0){
    if(parseInt(timeout) > 0){
      if(key in this.timeoutRef) clearTimeout(this.timeoutRef[key]);
      this.timeoutRef[key] = setTimeout(() => {
        console.log('cacheDecorator','cache expire for key '+key)
        this.delCache(key);
      },timeout);
    }
    return this.fnCache[key] = val;
  };

  this.delCache = function(namespace){
    var that = this;
    var invalidKeys  = [];
    if(namespace != '*'){
      Object.keys(this.fnCache).forEach((k) => {
        if(k.indexOf(namespace) === 0)invalidKeys.push(k);
      });
    } else {
      invalidKeys = Object.keys(this.fnCache);
    }
    invalidKeys.map((key) => {
      if(key in this.timeoutRef){
        clearTimeout(this.timeoutRef[key]);
        delete this.timeoutRef[key];
      }
      that.fnCache[key] = undefined;
      delete that.fnCache[key];
    });
  };

  this.withCache = function(func,explicitId,timeout){
    let id = explicitId || getUniqCacheId();

    return function(){
      var args = [].slice.call(arguments,0);
      var key = id+'-'+args.map(argsSerializer).join('-');
      var cachedVal = that.getCache(key);

      if (!cachedVal ){
          //cache the original
        console.log('cacheDecorator','cache miss for key : ' + key);
        cachedVal = func.apply(this,args);
        that.setCache(key,cachedVal,timeout);
      } else {
        console.log('cacheDecorator','cache hit for key : ' + key);
      }

      //rewrapPromise, on promise or object will
      //return a copy of the cached value
      //so that the original reference to the cached object doesn't leak.
      var valueOrPromise = rewrapPromise(cachedVal);
      if(isPromiseLike(valueOrPromise)){
        valueOrPromise.catch(() => {
          this.delCache(key);
        })
      }
      return valueOrPromise;
    };
  };
}
let cacheInstance = new CacheDecorator();

export default cacheInstance;
