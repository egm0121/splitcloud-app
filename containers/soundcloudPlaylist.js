import PlaylistContainer from './playlistContainer';
import withPlaylistProvider from './withPlaylistProvider';
import config from '../helpers/config';
import SoundCloudApi from '../modules/SoundcloudApi';

export default withPlaylistProvider((props) => {
  let scApi = new SoundCloudApi({clientId: config.SC_CLIENT_ID});
  return scApi.getScPlaylist(props.playlist.id);
})(PlaylistContainer);