/**
 * Google Blog (The Keyword) - Main Application Bootstrap
 * Reconstructed from Module 9960 in blog.google Webpack bundle
 */

import { initializeComponents } from './core/ComponentRegistry.js';
import { registerWebComponents } from './webcomponents/LitElementBase.js';
import analyticsDispatcher from './analytics/AnalyticsDispatcher.js';

// Components
import { HeaderComponent } from './components/Header.js';
import { FooterComponent } from './components/Footer.js';
import { SearchBarComponent } from './components/SearchBar.js';
import { CarouselComponent } from './components/Carousel.js';
import { NewsletterFormComponent } from './components/NewsletterForm.js';
import { VideoPlayerComponent } from './components/VideoPlayer.js';
import { LatestNewsFeedComponent } from './components/LatestNewsFeed.js';
import { LanguagePickerComponent } from './components/LanguagePicker.js';
import { CookieBannerComponent } from './components/CookieBanner.js';

// Styles
import './styles/main.css';

/**
 * Global Component Mapping for data-component attributes
 */
export const COMPONENT_MAP = {
  'uni-header': HeaderComponent,
  'uni-footer-component': FooterComponent,
  'uni-search-bar': SearchBarComponent,
  'uni-carousel': CarouselComponent,
  'uni-hero-carousel': CarouselComponent,
  'uni-landing-newsletter': NewsletterFormComponent,
  'uni-newsletter-form': NewsletterFormComponent,
  'uni-video-player': VideoPlayerComponent,
  'uni-newsflash': VideoPlayerComponent,
  'uni-latest-news-feed': LatestNewsFeedComponent,
  'uni-lang-picker': LanguagePickerComponent,
  'glue-cookie-notification-bar': CookieBannerComponent
};

/**
 * Trusted Types Policy Initialization (CSP Compliance)
 */
function initTrustedTypes() {
  if (window.trustedTypes && window.trustedTypes.createPolicy) {
    try {
      window.trustedTypes.createPolicy('default', {
        createHTML: (string) => string,
        createScriptURL: (string) => string,
        createScript: (string) => string
      });
    } catch (_) {
      // Policy already exists or disabled
    }
  }
}

/**
 * Application Bootstrap
 */
export class Application {
  constructor() {
    this.componentMap = COMPONENT_MAP;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('%c[Google Blog REA]%c Reconstructed Application Initializing...', 'color: #1a73e8; font-weight: bold;', 'color: inherit;');

    // 1. CSP / Trusted Types
    initTrustedTypes();

    // 2. Custom Elements
    registerWebComponents();

    // 3. Mount DOM Components
    initializeComponents(this.componentMap, document);

    // 4. Initial Page View Analytics
    analyticsDispatcher.dispatch({
      event: 'page_view',
      category: 'navigation',
      action: 'view',
      label: document.title,
      contentType: document.body.dataset.contentType || 'homepage'
    });

    console.log('%c[Google Blog REA]%c Application Ready.', 'color: #34a853; font-weight: bold;', 'color: inherit;');
  }
}

export const app = new Application();

// Auto-boot on DOMContentLoaded or immediate if already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

export default app;
