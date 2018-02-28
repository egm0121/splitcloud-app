class Listener {
  constructor (notifier, key, cb) {
    this.notifier = notifier
    this.name = key
    this.cb = cb
  }

  off () {
    this.notifier.removeListener(this)
  }
}

class Notifier {
  constructor () {
    this.listeners = new Set()
  }

  removeListener (listener) {
    this.listeners.delete(listener)
  }

  onSceneDidFocus(route) {
    
    this.listeners.forEach((listener) => {
      if (listener.name === route.name) {
        listener.cb()
      }
    });
  }

  addListener (routeName, cb) {
    const listener = new Listener(
      this,
      routeName,
      cb
    )
    this.listeners.add(listener)
    return listener
  }
}

export default (new Notifier())