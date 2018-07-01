export const getCurrentPlaylistBySide = (store,side) => {
  let currPlaylist = store.getState().playlist
      .find(curr => curr.side == side);
  let currPlaylistStore = store.getState().playlistStore
    .find(playlistData => playlistData.id == currPlaylist.currentPlaylistId);
  return currPlaylistStore;
}

export const getCurrentTrackBySide = (store, side) => {
  const playlist = getCurrentPlaylistBySide(store, side);
  return playlist.tracks[playlist.currentTrackIndex];
}