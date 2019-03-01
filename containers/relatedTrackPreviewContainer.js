import React from 'react';
import { connect } from 'react-redux';
import PlaylistContainer from './playlistContainer';
import withPlaylistProvider from './withPlaylistProvider';
import config from '../helpers/config';
import SoundCloudApi from '../modules/SoundcloudApi';
import { isLocalTrack } from '../helpers/formatters';
import { getCurrentTrackBySide } from '../redux/selectors/playlistSelector';

const RelatedTracksComponent = withPlaylistProvider((props) => {
  let scApi = new SoundCloudApi({clientId: config.SC_CLIENT_ID});
  return scApi.getRelatedTracks(props.track.id);
},{
  infiniteScroll: false,
  offset: 0,
  limit: 5,
  shouldFetchData: (prevProps,props) => {
    return prevProps.track && prevProps.track.id !== props.track.id;
  }
})(PlaylistContainer);
const MaybeRelatedTracksComponent = (props) => {
  console.log('MaybeRelatedTracksComponent got track', props.track)
  if( !props.track || isLocalTrack(props.track) ) return null;
  return <RelatedTracksComponent layout='horizontal' {...props} />
};

const mapStateToProps = (state, props) => {
  return {
    track : getCurrentTrackBySide(state, props.side)
  }
};
 
export default connect(mapStateToProps)(MaybeRelatedTracksComponent);