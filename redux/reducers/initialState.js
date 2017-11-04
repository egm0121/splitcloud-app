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
    tracks:[],
    playbackQueue:[],
    filterTracks:'',
    currentTrackIndex: 0,
    side : playbackModeTypes.LEFT
  },
  {
    tracks:[],
    playbackQueue:[],
    filterTracks:'',
    currentTrackIndex: 0,
    side : playbackModeTypes.RIGHT
  }]
};
export default initialState;
