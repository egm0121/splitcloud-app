import { playbackModeTypes } from '../constants/actions';
import { FEATURE_SC_EXPORT, FEATURE_SOCIAL_SHARE, FEATURE_SHUFFLE, FEATURE_REPEAT } from '../../helpers/constants';
const initialState = {
  mode : playbackModeTypes.SPLIT,
  reviewState:{
    actionCounter : 0,
    done: false,
    shared: false,
  },
  settings : {
    offlineMode : true
  },
  featureDiscovery : { 
    [FEATURE_SC_EXPORT] : true,
    [FEATURE_SOCIAL_SHARE] : false,
    [FEATURE_SHUFFLE] : false,
    [FEATURE_REPEAT] : true,
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
    repeat : false,
    inverted : false
  },{
    side: playbackModeTypes.RIGHT,
    pan : 1,
    muted : 0,
    repeat : false,
    inverted : false
  }],
  playlist : [{
    filterTracks:'',//deprecated
    currentPlaylistId: 'default_' + playbackModeTypes.LEFT,
    shuffle:false,
    side : playbackModeTypes.LEFT
  },
  {
    filterTracks:'',//deprecated
    currentPlaylistId: 'default_' + playbackModeTypes.RIGHT,
    shuffle:false,
    side : playbackModeTypes.RIGHT
  }],
  playlistStore:[
    //saved user playlist
    {
      id : 'default_' + playbackModeTypes.LEFT,
      currentTrackIndex: 0,
      tracks :[],
      history:[],
    },
    {
      id : 'default_' + playbackModeTypes.RIGHT,
      currentTrackIndex: 0,
      tracks :[],
      history:[],
    },
    //current queue playlist
    {
      id : 'playbackQueue_' + playbackModeTypes.LEFT,
      currentTrackIndex: 0,
      tracks :[],
      history:[],
    },
    {
      id : 'playbackQueue_' + playbackModeTypes.RIGHT,
      currentTrackIndex: 0,
      tracks :[],
      history:[],
    }
  ]
};
export default initialState;
