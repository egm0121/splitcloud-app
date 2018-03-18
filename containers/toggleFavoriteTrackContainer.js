/**
 * @flow
 */

import React, { PropTypes, Component } from 'react';
import { AppRegistry, Alert } from 'react-native';
import { connect } from 'react-redux';
import ToggleFavoriteButton from '../components/toggleFavoriteButton';
import {
  pushNotification
} from '../redux/actions/notificationActions';
import { 
  removePlaylistItem,
  addPlaylistItem 
} from '../redux/actions/currentPlaylistActions';

class ToggleFavoriteTrackContainer extends Component {
  constructor(props){
    super(props);
  }
  render() {
    return (
      <ToggleFavoriteButton 
        isFavorite={this.props.isFavorite} 
        onPressed={this.props.onToggleFavorite} 
        disabled={!this.props.track.id}
        {...this.props} />
    );
  }
}
ToggleFavoriteTrackContainer.propTypes = {
  side : PropTypes.string.isRequired,
  track : PropTypes.object.isRequired,
  style : PropTypes.array,
  inlineLayout : PropTypes.bool
}
const mapStateToProps = (state,props) => {
  let favoritePlaylist = state.playlistStore.find(
    p => p.id == 'default_' + props.side
  );
  return {
    isFavorite : !!favoritePlaylist.tracks.find(t => t.id == props.track.id)
  };
};
const mapDispatchToProps = (dispatch,props) => ({
  onToggleFavorite(isFavorite){
    const actionMessage = isFavorite ? 'Removed' : 'Added';

    const showFeedback = () => dispatch(pushNotification({type:'success',message:'Favorite '+actionMessage}));
    if(isFavorite){
      Alert.alert('Remove track from favorites?','',[
        {
          text:'Yes',
          onPress:() => dispatch(
            removePlaylistItem(props.side,props.track,'default_'+props.side)
          ) && showFeedback(),
          style:'positive'
        },{
          text: 'Cancel',
          onPress: () =>{}
        }
      ]);  
    } else {
      dispatch(addPlaylistItem(props.side,props.track,'default_'+props.side));
      showFeedback();
    }
  }
});
const ConnectedToggleFavoriteTrackContainer = connect(mapStateToProps,mapDispatchToProps)(ToggleFavoriteTrackContainer);
AppRegistry.registerComponent('ToggleFavoriteTrackContainer', () => ConnectedToggleFavoriteTrackContainer);

export default ConnectedToggleFavoriteTrackContainer;