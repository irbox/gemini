/**
 * Reactive Centralized Store / Event Bus
 * Reconstructed from Module 8376 in blog.google Webpack bundle
 */

export class Store {
  constructor() {
    this.subscribers = {};
    this.state = {};
  }

  /**
   * Dispatches an action / event to all registered subscribers
   * @param {string} type - Event action type
   * @param {Object} data - Payload data
   */
  dispatch(type = '', data = {}) {
    const payload = { type, data };
    Object.keys(this.subscribers).forEach((key) => {
      try {
        this.subscribers[key](payload);
      } catch (err) {
        console.error(`Error in store subscriber [${key}]:`, err);
      }
    });
  }

  /**
   * Subscribes a callback to store events
   * @param {string} key - Unique subscriber ID
   * @param {Function} callback - Callback function receiving { type, data }
   */
  subscribe(key, callback) {
    this.subscribers[key] = callback;
  }

  /**
   * Unsubscribes a callback from store events
   * @param {string} key - Unique subscriber ID
   */
  unsubscribe(key) {
    delete this.subscribers[key];
  }

  /**
   * Sets a reactive state key-value pair
   */
  setState(key, value) {
    this.state[key] = value;
    this.dispatch(`STATE_CHANGED/${key.toUpperCase()}`, { key, value });
  }

  /**
   * Retrieves a reactive state value
   */
  getState(key) {
    return this.state[key];
  }
}

// Global singleton instance
export const globalStore = new Store();
export default globalStore;
