export function stripSSL(url){
  return url ? url.replace(/^(https)/,'http') : url;
}
export function toArray(arr){
  return arr && Array.isArray(arr) ? arr : []
}
