export default {
  1: (state) => ({...state}),
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
  }
}
