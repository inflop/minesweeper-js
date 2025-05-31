export class EventManager {
  constructor() {
    this._eventListeners = [];
  }

  addEventListener(type, eventHandler) {
    this._eventListeners.push({ type, eventHandler });
  }

  dispatchEvent(event) {
    this._eventListeners
      .filter(listener => event.type === listener.type)
      .forEach(listener => listener.eventHandler(event));
  }

  removeEventListener(type, eventHandler) {
    this._eventListeners = this._eventListeners.filter(
      listener => !(listener.type === type && listener.eventHandler === eventHandler)
    );
  }

  clearEventListeners() {
    this._eventListeners = [];
  }
}