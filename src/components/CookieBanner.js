/**
 * Google Cookie Notification Bar Integration
 * Reconstructed from Module 2574 in blog.google Webpack bundle
 */

import { BaseComponent } from '../core/BaseComponent.js';
import { FOOTER_ACTIONS } from './Footer.js';
import analyticsDispatcher from '../analytics/AnalyticsDispatcher.js';

export class CookieBannerComponent extends BaseComponent {
  constructor(element) {
    super(element);
    this.isVisible = true;
  }

  _elements() {
    this.ui = {
      ...this.loadElements({
        acceptBtn: '.glue-cookie-notification-bar__accept, button[data-action="accept"]',
        moreBtn: '.glue-cookie-notification-bar__more, a[data-action="more"]',
        closeBtn: '.glue-cookie-notification-bar__close'
      })
    };
  }

  _events() {
    if (this.ui.acceptBtn) {
      this.ui.acceptBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.dismiss(true);
      });
    }

    if (this.ui.closeBtn) {
      this.ui.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.dismiss(false);
      });
    }

    // Inform store banner is visible
    this.store.dispatch(FOOTER_ACTIONS.COOKIE_VISIBLE);
  }

  dismiss(accepted) {
    this.isVisible = false;
    this.el.style.display = 'none';

    // Store in localStorage
    try {
      localStorage.setItem('glue_cookie_consent', accepted ? 'accepted' : 'dismissed');
    } catch (_) {}

    this.store.dispatch(FOOTER_ACTIONS.COOKIE_HIDDEN);

    analyticsDispatcher.dispatch({
      event: 'cookie_banner_action',
      category: 'consent',
      action: accepted ? 'accept' : 'dismiss',
      label: 'Cookie Notification Bar',
      contentType: 'consent'
    });
  }
}

export default CookieBannerComponent;
