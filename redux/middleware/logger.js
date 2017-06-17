const logger = store => {
  return next => {
    return action => {
      console.info('REDUX: action ->', action)
      let result = next(action)
      console.info('REDUX: state ->', store.getState())
      return result;
    }
  }
}

export default logger ;
