import * as StoreReview from 'react-native-store-review';
import { actionTypes } from '../constants/actions';
import { reviewCountDoneAction } from '../actions/storeReviewAction';
import { MAX_REVIEW_POSITIVE_ACTIONS, MAX_INTERACTION_COUNT, MAX_DAILY_INTERACTION_COUNT } from '../../helpers/constants';
const actionTypeWhitelist = [
  actionTypes.INCREMENT_CURR_PLAY_INDEX,
  actionTypes.DECREMENT_CURR_PLAY_INDEX,
  actionTypes.CHANGE_CURR_PLAY_INDEX
];
const StoreReviewRequestor = store => {
  return next => {
    return action => {      
      const state = store.getState().reviewState;
      let result = null;
      if( actionTypeWhitelist.indexOf(action.type) > -1 ){
        // This API is only available on iOS 10.3 or later
        if ( state.actionCounter == MAX_REVIEW_POSITIVE_ACTIONS ) {
          console.log('trigger appstore review panel!')
          StoreReview.isAvailable && StoreReview.requestReview();
          store.dispatch(reviewCountDoneAction());
        }
        if ( 
          state.actionCounter === MAX_INTERACTION_COUNT ||
          state.dailyActionCounter === MAX_DAILY_INTERACTION_COUNT
        ) {
          console.log('max songs reached  - block inflight change track action')
        } else {
          result = next(action);
        }
      } else {
        result = next(action);
      }
      return result;
    }
  }
};

export default StoreReviewRequestor ;
