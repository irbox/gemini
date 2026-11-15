/**
 * Base Component for Google Glue Architecture
 * Reconstructed from Module 398 in blog.google Webpack bundle
 */

import { generateId } from './utils.js';
import { Logger } from './Logger.js';
import globalStore from './Store.js';

export class BaseComponent {
  constructor(element) {
    if (element) {
      this.el = element;
      const componentName = element.getAttribute('data-component') || 'component';
      this.id = `${componentName}_${generateId()}`;
      this.store = globalStore;
      this.update = this.update.bind(this);
      this.debug = new Logger({ title: `[${componentName}]` });
    }
  }

  /**
   * Initializes component elements, events, and store subscriptions
   */
  init() {
    this._elements();
    this._events();
    this.store.subscribe(this.id, this.update);
    return this;
  }

  /**
   * Hook called after all components in DOM have been initialized
   */
  afterInit() {}

  /**
   * Cache DOM elements required by this component
   */
  _elements() {}

  /**
   * Bind event listeners
   */
  _events() {}

  /**
   * Reactive state/event handler from Store
   * @param {Object} event - { type, data }
   */
  update({ type, data }) {}

  /**
   * Reads and parses JSON options from a data-attribute
   * @param {string} attrName - Attribute name (e.g. 'data-options')
   * @param {HTMLElement} element - Target element (defaults to this.el)
   */
  getOptions(attrName, element = this.el) {
    const rawValue = element.getAttribute(attrName);
    let options = {};
    if (rawValue) {
      try {
        options = JSON.parse(rawValue);
      } catch (err) {
        this.debug.error(`Options are corrupted on attribute ${attrName} =>`, err);
      }
    }
    return options;
  }

  /**
   * Utility to query multiple selectors into a dictionary of elements
   * @param {Object.<string, string>} selectorMap
   */
  loadElements(selectorMap) {
    const elements = {};
    for (const [key, selector] of Object.entries(selectorMap)) {
      elements[key] = this.el.querySelector(selector);
    }
    return elements;
  }

  /**
   * Utility to query multiple selectors into a dictionary of NodeLists
   * @param {Object.<string, string>} selectorMap
   */
  loadElementsAll(selectorMap) {
    const elements = {};
    for (const [key, selector] of Object.entries(selectorMap)) {
      elements[key] = this.el.querySelectorAll(selector);
    }
    return elements;
  }

  /**
   * Destroys component, removes store subscriptions
   */
  destroy() {
    this.store.unsubscribe(this.id);
  }
}

export default BaseComponent;
