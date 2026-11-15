/**
 * Core Utilities & Helper Functions
 * Reconstructed from Modules 4202, 1807, 5480 in blog.google Webpack bundle
 */

let counter = 0;

/**
 * Generates a unique monotonic element/component identifier
 * Module 4202
 */
export function generateId() {
  return `${Date.now()}_${++counter}`;
}

/**
 * Throttles execution of a callback function
 * Module 1807
 */
export function throttle(func, wait = 100, leading = true) {
  let timeout = null;
  let previous = 0;

  return function (...args) {
    const now = Date.now();
    if (!previous && !leading) previous = now;
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = leading ? Date.now() : 0;
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Debounces execution of a callback function
 */
export function debounce(func, wait = 150) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Detects RTL layout
 */
export function isRTL() {
  return document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
}

/**
 * Classifies link type for analytics tracking (Module 5480)
 */
export function getLinkType(element) {
  if (!element) return 'unknown';
  const href = element.getAttribute('href') || '';
  if (href.startsWith('mailto:')) return 'email';
  if (href.startsWith('tel:')) return 'phone';
  if (href.startsWith('#')) return 'anchor';
  if (href.startsWith('/') || href.includes('blog.google')) return 'internal';
  return 'external';
}

/**
 * Event Constants (Module 221)
 */
export const DOM_EVENTS = {
  CLICK: 'click',
  CHANGE: 'change',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',
  LOAD: 'load',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  PAGESHOW: 'pageshow',
  FOCUSOUT: 'focusout',
  SUBMIT: 'submit',
  MUTATION: 'mutation'
};
