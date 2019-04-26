const logger = (excludeActions = []) => store => {
  return next => {
    return action => {
      let result = next(action);
      if(!excludeActions.includes(action.type)) {
        console.info('REDUX: action ->', action)
        console.info('REDUX: state ->', store.getState())
      } else {
        console.log('excluded redux action',action.type);
      }
      return result;
    }
  }
}

export default logger ;
