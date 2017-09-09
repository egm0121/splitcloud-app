export function stripSSL(url){
  return url ? url.replace(/^(https)/,'http') : url;
}
