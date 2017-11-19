import { playbackModeTypes } from '../constants/actions';

const initialState = {
  mode : playbackModeTypes.SPLIT,
  settings : {
    offlineMode : true
  },
  notifications : {
    list : []
  },
  songPickers :[{
    side : playbackModeTypes.LEFT,
    searchTerms : '',
    isLoading: false,
    recentQueryList : []
  },
  {
    side : playbackModeTypes.RIGHT,
    searchTerms : '',
    isLoading: false,
    recentQueryList : []
  }],
  uploaderProfile:[{
    side:playbackModeTypes.LEFT,
    lastUploaderUrl:null
  },
  {
    side:playbackModeTypes.RIGHT,
    lastUploaderUrl:null
  }],
  players : [{
    side: playbackModeTypes.LEFT,
    pan :-1,
    muted : 0,
    inverted : false
  },{
    side: playbackModeTypes.RIGHT,
    pan : 1,
    muted : 0,
    inverted : false
  }],
  playlist : [{
    filterTracks:'',//deprecated
    currentPlaylistId: 'default_' + playbackModeTypes.LEFT,
    side : playbackModeTypes.LEFT
  },
  {
    filterTracks:'',//deprecated
    currentPlaylistId: 'default_' + playbackModeTypes.RIGHT,
    side : playbackModeTypes.RIGHT
  }],
  playlistStore:[
    {
      id : 'default_' + playbackModeTypes.LEFT,
      currentTrackIndex: 0,
      tracks :[]
    },
    {
      id : 'default_' + playbackModeTypes.RIGHT,
      currentTrackIndex: 0,
      tracks :[]
    },
    {
      id : 'playbackQueue_' + playbackModeTypes.LEFT,
      currentTrackIndex: 0,
      tracks :[]
    },
    {
      id : 'playbackQueue_' + playbackModeTypes.RIGHT,
      currentTrackIndex: 0,
      tracks :[]
    }
  ]
};
export default initialState;
