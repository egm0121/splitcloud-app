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
  }
}
