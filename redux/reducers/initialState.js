import { playbackModeTypes } from '../constants/actions';

const initialState = {
  mode : playbackModeTypes.SPLIT,
  notifications : {
    list : []
  },
  songPickers :[{
    side : playbackModeTypes.LEFT,
    searchTerms : '',
    recentQueryList : []
  },
  {
    side : playbackModeTypes.RIGHT,
    searchTerms : '',
    recentQueryList : []
  }],
  players : [{
    side: playbackModeTypes.LEFT,
    pan :-1,
    muted : 0
  },{
    side: playbackModeTypes.RIGHT,
    pan : 1,
    muted : 0
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
