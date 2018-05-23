import React, { PropTypes, Component } from 'react';

export default function(playlistProvider){
  return function(PlaylistComponent){
    return class withPlaylistProvider extends Component{
      constructor(props){
        super(props);
        this.state = {
          playlist : props.playlist
        };
      }
      componentDidMount(){
        console.log('HoC withPlaylistProvider props',this.props);
        playlistProvider(this.props).then((playlist) => {
          this.setState({playlist});
        })
      }
      render(){
        return <PlaylistComponent {...this.props} playlist={this.state.playlist}/>
      }
    }
  }
}
