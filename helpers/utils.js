export function stripSSL(url){
  return url ? url.replace(/^(https)/,'http') : url;
}
export function toArray(arr){
  return arr && Array.isArray(arr) ? arr : []
}

export function isFunction(obj){
  return obj && typeof obj === 'function';
}

export function isObject(obj){
  return obj && typeof obj === 'object';
}