
export const getCurrentPlaylistBySide = (state,side) => {
  let currPlaylist = state.playlist
      .find(curr => curr.side == side);
  let currPlaylistStore = state.playlistStore
    .find(playlistData => playlistData.id == currPlaylist.currentPlaylistId);
  return currPlaylistStore;
}

export const getCurrentTrackBySide = (state, side) => {
  const playlist = getCurrentPlaylistBySide(state, side);
  return playlist.tracks[playlist.currentTrackIndex];
}