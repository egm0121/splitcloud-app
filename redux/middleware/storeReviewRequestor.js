import * as StoreReview from 'react-native-store-review';
import { actionTypes } from '../constants/actions';
import { incrementPositiveAction } from '../actions/storeReviewAction';
import { MAX_REVIEW_POSITIVE_ACTIONS } from '../../helpers/constants';
const actionTypeWhitelist = [
  actionTypes.INCREMENT_CURR_PLAY_INDEX,
  actionTypes.DECREMENT_CURR_PLAY_INDEX,
  actionTypes.CHANGE_CURR_PLAY_INDEX
];

const StoreReviewRequestor = store => {
  return next => {
    return action => {
      console.log(' store middleware');
      let result = next(action);
      const state = store.getState().reviewState;
      if( actionTypeWhitelist.indexOf(action.type) > -1 ){
        // This API is only available on iOS 10.3 or later
        if ( state.actionCounter == MAX_REVIEW_POSITIVE_ACTIONS ) {
          console.log('trigger appstore review panel!')
          StoreReview.isAvailable && StoreReview.requestReview();
        }
        store.dispatch(incrementPositiveAction());
      }
      return result;
    }
  }
};

export default StoreReviewRequestor ;
