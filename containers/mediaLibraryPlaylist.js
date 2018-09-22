import PlaylistContainer from './playlistContainer';
import withPlaylistProvider from './withPlaylistProvider';
import MediaLibraryApi from '../modules/MediaLibraryApi';
import { messages } from '../helpers/constants';
const playlistMap ={
  'album':'getAlbum',
  'artist':'getArtist'
};
const MediaLibraryPlaylist = withPlaylistProvider((props) => {
  let mediaPlayerApi = new MediaLibraryApi();
  let methodName = playlistMap[props.browseCategory];
  return mediaPlayerApi[methodName](props.playlist.label);
},{emptyLabel:messages.EMPTY_LIBRARY_PLAYLIST})(PlaylistContainer);

export default MediaLibraryPlaylist;