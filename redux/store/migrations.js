import initialState from '../reducers/initialState';
export default {
  1: (state) => {
    return {...state};
  },
  2: (state) => {
    if(!state || !state.players) return state;
    let toState =  {...state};
    toState.players = toState.players.map(
      player => ({...player,inverted: false})
    );
    return toState;
  },
  3: (state) => {
    if(!state || !state.playlist) return state;
    let toState = {...state};
    toState.playlist = toState.playlist.map(playlist => {
      playlist.playbackQueue = [...playlist.tracks].map(
        (t) => {
          if(!('isVisible' in t)){
            t.isVisible = true;
          }
          return t;
        }
      );
      playlist.filterTracks = '';
      return playlist;
    });
    return toState;
  },
  4: (state) => {
    if(!state || !state.playlist) return state;
    let toState = {...state};
    toState.playlist.forEach(playlist => {
      playlist.tracks = undefined;
      delete playlist.tracks
    });
    return toState;
  },
  11: (state) => {
    let copyState = {...state};
    if(copyState.backup)delete copyState.backup;
    return {
      ...state,
      backup: {...copyState}
    };
  },
  12: (state) => {
    if(!state || !state.playlist) return state;
    let toState = {...state};
    toState.playlistStore = [...initialState.playlistStore];
    toState.playlist.forEach(playlist => {
      let playlistStore =
        toState.playlistStore.find(curr => curr.id == 'default_' + playlist.side);
      playlistStore.tracks = playlist.playbackQueue;
      playlist.currentPlaylistId = 'default_' + playlist.side;
      playlist.playbackQueue = undefined;
      delete playlist.playbackQueue;
      delete playlist.tracks;
      delete playlist.currentTrackIndex;
    });
    return toState;
  },
  13: (state) => {
    return {...state, reviewState: initialState.reviewState};
  },
  16: (state) => {
    return {...state, featureDiscovery: initialState.featureDiscovery };
  },
  17: (state) => {
    return {
      ...state,
      featureDiscovery: {
        ...initialState.featureDiscovery,
        ...state.featureDiscovery,
      }
    }
  },
  18: (state) => {
    const newState = {...state};
    if( !state.playlist || !state.playlistStore) {
      console.log('migration 18 failed no playlist of playlistStore found');
      return newState;
    }
    //set new state prop 'shuffle' in each playlist
    newState.playlist = state.playlist.map(playlist => ({
      ...playlist,
      shuffle:false,
    }));
    //set history in each playlistStore
    newState.playlistStore = state.playlistStore.map(playlistStore => ({
      ...playlistStore,
      history:[],
    }));
    
    return newState;
  },
  19:(state) => {
    //added discovery flag for feature shuffle
    return {
      ...state,
      featureDiscovery: {
        ...initialState.featureDiscovery,
        ...state.featureDiscovery,
      }
    }
  },
  20:(state) => {
    //adds the daily max interaction fields
    const newState =  {
      ...state,
      reviewState: {
        ...initialState.reviewState,
        ...state.reviewState
      }
    }
    return newState;
  },
  22:(state) => {
    //adds the preview slice state
    const newState =  {
      ...state,
      preview: initialState.preview
    }
    return newState;
  }, 
  23: (state) => {
    const newState =  {
      ...state,
      featureDiscovery: {
        ...initialState.featureDiscovery,
        ...state.featureDiscovery,
      }
    }
    return newState;
  }
}
