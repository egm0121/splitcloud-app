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
    currentTrackIndex: 0,
    side : playbackModeTypes.LEFT
  },
  {
    tracks:[],
    currentTrackIndex: 0,
    side : playbackModeTypes.RIGHT
  }]
};
export default initialState;
