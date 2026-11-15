/**
 * SearchBar Component & Modal Overlay
 * Reconstructed from Class Q / Module 9960 & Chunk 6904 in blog.google Webpack bundle
 */

import { BaseComponent } from '../core/BaseComponent.js';
import analyticsDispatcher from '../analytics/AnalyticsDispatcher.js';

const OVERFLOW_HIDDEN = 'overflow-hidden-menu';
const MAX_QUERY_LENGTH = 80;

export class SearchBarComponent extends BaseComponent {
  constructor(element) {
    super(element);
    this.currentTerm = '';
    this.isSearching = false;
    this.suggestedSearches = [
      'Gemini',
      'Artificial Intelligence',
      'Pixel 9',
      'Android 15',
      'Google Maps',
      'Chrome',
      'Security',
      'Quantum Computing'
    ];
  }

  _elements() {
    this.ui = {
      ...this.loadElements({
        form: '.uni-search-bar__form',
        input: '.uni-search-bar__input',
        openBtn: '.uni-search-bar__toggle',
        closeBtn: '.uni-search-bar__cta--close',
        container: '.uni-search-bar__container',
        suggestedContainer: '.uni-search-bar__suggested-searches'
      })
    };
  }

  _events() {
    if (this.ui.openBtn) {
      this.ui.openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleSearch(true);
      });
    }

    if (this.ui.closeBtn) {
      this.ui.closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleSearch(false);
      });
    }

    if (this.ui.form) {
      this.ui.form.addEventListener('submit', (e) => {
        this.handleSubmit(e);
      });
    }

    if (this.ui.input) {
      this.ui.input.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.length > MAX_QUERY_LENGTH) {
          e.target.value = val.slice(0, MAX_QUERY_LENGTH);
        }
        this.currentTerm = e.target.value.trim();
      });
    }

    // Render suggested search pills
    this.renderSuggestedSearches();

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isSearching) {
        this.toggleSearch(false);
      }
    });
  }

  renderSuggestedSearches() {
    if (!this.ui.suggestedContainer) return;
    this.ui.suggestedContainer.innerHTML = '';

    this.suggestedSearches.forEach((term) => {
      const pill = document.createElement('li');
      pill.className = 'uni-search-bar__suggested-search-pill';
      pill.innerHTML = `
        <button type="button" class="uni-cta uni-cta--medium" data-term="${term}">
          ${term}
        </button>
      `;

      pill.querySelector('button')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToSearch(term);
      });

      this.ui.suggestedContainer.appendChild(pill);
    });
  }

  toggleSearch(open) {
    this.isSearching = typeof open === 'boolean' ? open : !this.isSearching;

    document.body.classList.toggle(OVERFLOW_HIDDEN, this.isSearching);
    this.el.classList.toggle('uni-nav--searching', this.isSearching);

    if (this.ui.container) {
      this.ui.container.setAttribute('aria-hidden', String(!this.isSearching));
      this.ui.container.classList.toggle('uni-search-bar__container--open', this.isSearching);
    }

    if (this.ui.openBtn) {
      this.ui.openBtn.setAttribute('aria-expanded', String(this.isSearching));
    }

    if (this.isSearching) {
      setTimeout(() => this.ui.input?.focus(), 100);
    } else {
      this.currentTerm = '';
      if (this.ui.input) this.ui.input.value = '';
      this.ui.openBtn?.focus();
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!this.currentTerm) return;
    this.goToSearch(this.currentTerm);
  }

  goToSearch(term) {
    if (!term) return;

    // Dispatch analytics
    analyticsDispatcher.dispatch({
      event: 'search_query',
      category: 'search',
      action: 'submit',
      label: term,
      contentType: 'search',
      searchTerm: term
    });

    const params = new URLSearchParams({ query: term });
    const targetUrl = `/search/?${params.toString()}`;

    // For in-page demo or routing
    console.log(`[SearchBar] Navigating to: ${targetUrl}`);
    window.location.href = targetUrl;
  }
}

export default SearchBarComponent;
