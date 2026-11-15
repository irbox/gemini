/**
 * Footer Component with Cookie Notification Bar padding adjustment
 * Reconstructed from Class d / Module 9960 in blog.google Webpack bundle
 */

import { BaseComponent } from '../core/BaseComponent.js';
import { DOM_EVENTS } from '../core/utils.js';

const COOKIE_BANNER_ID = 'glue-cookie-notification-bar-1';
const BODY_SELECTOR = 'body';
const FOOTER_SELECTOR = 'footer';

// Action constants matching modules 2574 and 3095
export const FOOTER_ACTIONS = {
  COOKIE_VISIBLE: 'VISIBLE/COOKIE_BANNER',
  COOKIE_HIDDEN: 'HIDE/COOKIE_BANNER',
  PADDING_ON: 'PADDING_ON/FOOTER',
  TOAST_OPENED: 'NEWSLETTER_TOAST/OPENED',
  TOAST_CLOSED: 'NEWSLETTER_TOAST/CLOSED'
};

export class FooterComponent extends BaseComponent {
  constructor(element) {
    super(element);
    this.elements = {};
  }

  init() {
    super.init();
    window.addEventListener(DOM_EVENTS.LOAD, () => {
      this.existCookieBanner(COOKIE_BANNER_ID);
    });
    return this;
  }

  _elements() {
    this.elements.cookieBanner = null;
  }

  update({ type, data }) {
    switch (type) {
      case FOOTER_ACTIONS.COOKIE_VISIBLE:
      case FOOTER_ACTIONS.PADDING_ON:
        this.adjustBodyPadding();
        break;
      case FOOTER_ACTIONS.COOKIE_HIDDEN:
        this.observeBody();
        break;
      case FOOTER_ACTIONS.TOAST_OPENED:
      case FOOTER_ACTIONS.TOAST_CLOSED:
        this.adjustFooterPadding(data);
        break;
    }
  }

  existCookieBanner(id) {
    const banner = document.getElementById(id);
    if (banner) {
      this.adjustBodyPadding();
    } else {
      this.observeBody();
    }
  }

  observeBody() {
    const body = document.querySelector(BODY_SELECTOR);
    if (!body) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          [...mutation.addedNodes].forEach((node) => {
            if (node.id === COOKIE_BANNER_ID) {
              this.adjustBodyPadding();
            }
          });
        }
      });
    });

    observer.observe(body, { attributes: true, childList: true });
    setTimeout(() => observer.disconnect(), 3000);
  }

  adjustBodyPadding() {
    const footer = document.querySelector(FOOTER_SELECTOR);
    const banner = document.getElementById(COOKIE_BANNER_ID);
    if (footer) {
      if (banner && getComputedStyle(banner).display !== 'none') {
        const height = getComputedStyle(banner).height;
        footer.style.paddingBottom = height;
      } else {
        footer.style.paddingBottom = '0px';
      }
    }
  }

  adjustFooterPadding({ size = '' } = {}) {
    if (this.el) {
      this.el.style.setProperty('--footer-toast-height', size);
    }
  }
}

export default FooterComponent;
