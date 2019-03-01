import React, { Component } from 'react';

export default function (
  playlistProvider, 
  { infiniteScroll, emptyLabel, initOffset , limit, shouldFetchData } = { infiniteScroll:false, offset:0,  limit:20 }) {
  return function (PlaylistComponent) {// eslint-disable-line
    return class withPlaylistProvider extends Component {
      constructor(props) {
        super(props);
        this.loadMoreOnScroll = this.loadMoreOnScroll.bind(this);
        this.state = {
          playlist: props.playlist || {},
          isLoading: false,
          offset: props.offset || initOffset,
          limit: props.limit || limit,
        };
        this.shouldFetchData = typeof shouldFetchData == 'function' ? 
          shouldFetchData : () => false;
      }

      loadMoreOnScroll() {
        if (!infiniteScroll || this.state.isLoading) return;
        const actualListSize = this.state.playlist ? this.state.playlist.tracks.length : 0;
        console.log('loadMore ', 'actual size', actualListSize, 'offset', this.state.offset);
        if (this.state.offset > 0 && actualListSize < this.state.offset) {
          this.setState({
            endReached: true,
          });
          console.log('end reached');
          return;
        }
        this.setState(state => ({
          offset: state.offset + state.limit,
        }));
      }

      componentDidUpdate(prevProps, prevState) {
        if (prevState.offset !== this.state.offset || this.shouldFetchData(prevProps, this.props)) {
          this.setState({ isLoading: true });
          playlistProvider(this.props, this.state.offset, this.state.limit).then((playlist) => {
            if (!this.state.playlist || !infiniteScroll) {
              return this.setState({
                playlist,
                isLoading: false,
              });
            }
            return this.setState((state) => {
              const tracks = (state.playlist.tracks || []).concat(playlist.tracks);
              const newPlaylist = state.playlist;
              newPlaylist.tracks = tracks;
              return {
                playlist: newPlaylist,
                isLoading: false,
              };
            });
          }).catch((err) => {
            console.log('withPlaylistProvider request failed', err);
            this.setState({ isLoading: false });
          });
        }
      }

      componentDidMount() {
        console.log('HoC withPlaylistProvider props', this.props);
        this.setState({ isLoading: true });
        playlistProvider(this.props, this.state.offset, this.state.limit).then((playlist) => {
          this.setState({
            playlist,
            isLoading: false,
          });
        }).catch((err) => {
          console.log('withPlaylistProvider request failed', err);
          this.setState({ isLoading: false });
        });
      }

      render() {
        return <PlaylistComponent {...this.props}
                playlist={this.state.playlist}
                isLoading={this.state.isLoading}
                onEndReached={this.loadMoreOnScroll}
                onEndThreshold={this.props.onEndThreshold}
                emptyLabel={emptyLabel}
              />;
      }
    };
  };
}
