/**
 * Newsletter Subscription Form & Modal Toast
 * Reconstructed from Module 3095 and Chunk 6169 in blog.google Webpack bundle
 */

import { BaseComponent } from '../core/BaseComponent.js';
import analyticsDispatcher from '../analytics/AnalyticsDispatcher.js';
import { FOOTER_ACTIONS } from './Footer.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBMISSION_ENDPOINT = 'https://services.google.com/fb/submissions/thekeywordtest/';

export class NewsletterFormComponent extends BaseComponent {
  constructor(element) {
    super(element);
    this.isSubmitting = false;
    this.isSubscribed = false;
  }

  _elements() {
    this.ui = {
      ...this.loadElements({
        form: 'form',
        input: 'input[type="email"]',
        submitBtn: 'button[type="submit"]',
        errorMsg: '.uni-newsletter__error, .uni-form-error',
        successMsg: '.uni-newsletter__success, .uni-form-success',
        toast: '.uni-newsletter-toast'
      })
    };
  }

  _events() {
    if (this.ui.form) {
      this.ui.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    if (this.ui.input) {
      this.ui.input.addEventListener('input', () => this.clearError());
    }
  }

  clearError() {
    if (this.ui.errorMsg) {
      this.ui.errorMsg.textContent = '';
      this.ui.errorMsg.style.display = 'none';
    }
    this.ui.input?.classList.remove('uni-input--error');
  }

  showError(message) {
    if (this.ui.errorMsg) {
      this.ui.errorMsg.textContent = message;
      this.ui.errorMsg.style.display = 'block';
    }
    this.ui.input?.classList.add('uni-input--error');
    this.ui.input?.focus();
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (this.isSubmitting) return;

    const email = (this.ui.input?.value || '').trim();

    if (!email) {
      this.showError('Email address is required.');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      this.showError('Please enter a valid email address.');
      return;
    }

    this.isSubmitting = true;
    if (this.ui.submitBtn) {
      this.ui.submitBtn.disabled = true;
      this.ui.submitBtn.setAttribute('aria-busy', 'true');
    }

    try {
      // Dispatch analytics tracking
      analyticsDispatcher.dispatch({
        event: 'newsletter_subscribe_submit',
        category: 'newsletter',
        action: 'submit',
        label: 'Newsletter Form',
        contentType: 'newsletter'
      });

      // Simulated network submission with fallback
      await new Promise((resolve) => setTimeout(resolve, 800));

      this.isSubscribed = true;
      this.showSuccess();

      // Trigger store action for footer adjustment
      this.store.dispatch(FOOTER_ACTIONS.TOAST_OPENED, { size: '64px' });
    } catch (err) {
      this.showError('Something went wrong. Please try again later.');
    } finally {
      this.isSubmitting = false;
      if (this.ui.submitBtn) {
        this.ui.submitBtn.disabled = false;
        this.ui.submitBtn.removeAttribute('aria-busy');
      }
    }
  }

  showSuccess() {
    if (this.ui.form) {
      this.ui.form.style.display = 'none';
    }
    if (this.ui.successMsg) {
      this.ui.successMsg.style.display = 'block';
      this.ui.successMsg.textContent = 'Thanks for subscribing! Check your inbox for updates.';
    }
  }
}

export default NewsletterFormComponent;
