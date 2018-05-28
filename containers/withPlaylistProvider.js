import React, { PropTypes, Component } from 'react';

export default function(playlistProvider){
  return function(PlaylistComponent){
    return class withPlaylistProvider extends Component{
      constructor(props){
        super(props);
        this.state = {
          playlist : props.playlist,
          isLoading : false
        };
      }
      componentDidMount(){
        console.log('HoC withPlaylistProvider props',this.props);
        this.setState({isLoading:true});
        playlistProvider(this.props).then((playlist) => {
          this.setState({
            playlist,
            isLoading:false
          });
        })
      }
      render(){
        return <PlaylistComponent {...this.props} 
                playlist={this.state.playlist} 
                isLoading={this.state.isLoading}
              />
      }
    }
  }
}
