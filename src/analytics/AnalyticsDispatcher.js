/**
 * Analytics Dispatcher for Google Tag Manager & GA4
 * Reconstructed from Module 2878 in blog.google Webpack bundle
 */

import { generateId } from '../core/utils.js';
import globalStore from '../core/Store.js';

export const ANALYTIC_ACTION = 'ANALYTIC_DISPATCHER/DISPATCH_EVENT';

const REQUIRED_ATTRIBUTES = ['event', 'category', 'action', 'label', 'contentType'];

export class AnalyticsDispatcher {
  constructor() {
    window.dataLayer = window.dataLayer || [];
    this.id = generateId();

    // Subscribe to centralized store
    globalStore.subscribe(this.id, this.update.bind(this));

    // Process queued events if any
    if (Array.isArray(window.analyticsQueue)) {
      window.analyticsQueue.forEach((event) => this.dispatch(event));
      window.analyticsQueue = [];
    }
  }

  update({ type, data }) {
    if (type === ANALYTIC_ACTION) {
      this.handleDispatchEvent(data);
    }
  }

  dispatch(eventData) {
    this.handleDispatchEvent(eventData);
  }

  handleDispatchEvent(eventData = {}) {
    const customDimensions = window.globalKWCustomDimensions;
    const globalContentType = customDimensions && customDimensions.contentType;

    if (!eventData.contentType && globalContentType) {
      eventData.contentType = globalContentType;
    }

    const formatted = this.formatData(eventData);
    const builtEvent = this.buildEvent(formatted);
    this.dispatchEvent(builtEvent);
  }

  formatData(data) {
    this.validateRequiredAttributes(data);
    data.label = this.removeTwitterHandles(data.label);
    return data;
  }

  buildEvent(eventData) {
    if (!Array.isArray(window.dataLayer)) {
      throw new Error('Cannot dispatch analytic event: Invalid DataLayer');
    }
    const previousEvent =
      window.dataLayer.length === 0 ? {} : window.dataLayer[window.dataLayer.length - 1];
    return this.diffEventData(previousEvent, eventData);
  }

  dispatchEvent(eventData) {
    if (!Array.isArray(window.dataLayer)) {
      throw new Error('Cannot dispatch analytic event: Invalid DataLayer');
    }
    const sanitized = this.diffEventData({}, eventData);
    window.dataLayer.push(sanitized);

    // Also trigger custom DOM event for debugging / listeners
    window.dispatchEvent(new CustomEvent('analytics-event-dispatched', { detail: sanitized }));
  }

  validateRequiredAttributes(data) {
    for (const attr of REQUIRED_ATTRIBUTES) {
      if (!(attr in data)) {
        // Fallback default rather than crashing in demo environment
        data[attr] = data[attr] || 'undefined';
      }
    }
  }

  diffEventData(previous, current) {
    const result = {};
    Object.keys(previous)
      .filter((k) => typeof previous[k] !== 'function' && k !== 'gtm.uniqueEventId')
      .forEach((key) => {
        result[key] = key in current ? (current[key] === 'undefined' ? undefined : current[key]) : undefined;
      });

    Object.entries(current).forEach(([k, v]) => {
      result[k] = v === 'undefined' ? undefined : v;
    });

    return result;
  }

  removeTwitterHandles(str) {
    if (!str) return '';
    return str
      .replace(/@\w+/g, '<Twitter Handle>')
      .replace(/twitter\.com\/(?!hashtag)\w+/g, 'twitter.com/twitter-handle');
  }
}

export const analyticsDispatcher = new AnalyticsDispatcher();

// Expose on window for compatibility with Glue templates
window.uniAnalyticsDispatcher = analyticsDispatcher;

export default analyticsDispatcher;
