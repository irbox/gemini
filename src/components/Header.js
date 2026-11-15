/**
 * Header & Navigation Component
 * Reconstructed from Class f / Module 9960 in blog.google Webpack bundle
 */

import { BaseComponent } from '../core/BaseComponent.js';
import { throttle, getLinkType } from '../core/utils.js';
import analyticsDispatcher from '../analytics/AnalyticsDispatcher.js';

const OVERFLOW_HIDDEN_MENU = 'overflow-hidden-menu';
const SUBSCRIBE_CTA_EVENT = 'newsletter_subscribe_cta_click';
const SUBSCRIBE_URL = '/newsletter-subscribe/';

export class HeaderComponent extends BaseComponent {
  constructor(element) {
    super(element);
    this.isMenuOpen = false;
    this.lastScrollTop = 0;
  }

  _elements() {
    this.ui = {
      ...this.loadElements({
        navMenu: '.uni-nav__nav',
        mobileMenu: '.uni-nav-mobile',
        navMobileContainer: '.uni-nav-mobile__container',
        mobileMenuOverlay: '.uni-nav-mobile__wrapper',
        progressBar: '.uni-nav__progress-bar',
        newsletterSubscribeButton: '.uni-nav__subscribe button',
        jumpToContentBtn: '.uni-nav__jump-to-content'
      }),
      menuBtns: this.el.querySelectorAll('.uni-nav__menu-btn'),
      dropdownButtons: this.el.querySelectorAll('.uni-nav-link--dropdown'),
      mobileSubnavTriggers: this.el.querySelectorAll('.uni-nav-link--has-subnav'),
      mobileSubnavBackBtns: this.el.querySelectorAll('.uni-nav-mobile-subnav__back-btn'),
      mobileSublistTriggers: this.el.querySelectorAll('.uni-nav-mobile-subnav__sublist-trigger')
    };
  }

  _events() {
    // Mobile menu triggers
    this.ui.menuBtns.forEach((btn) => {
      btn.addEventListener('click', () => this.toggleMobileMenu(true));
    });

    if (this.ui.mobileMenuOverlay) {
      this.ui.mobileMenuOverlay.addEventListener('click', (e) => {
        if (e.target === this.ui.mobileMenuOverlay) {
          this.toggleMobileMenu();
        }
      });
    }

    // Newsletter subscribe CTA
    if (this.ui.newsletterSubscribeButton) {
      this.ui.newsletterSubscribeButton.addEventListener('click', (e) =>
        this.handleSubscribeNewsletterClick(e)
      );
    }

    // Dropdowns
    this.ui.dropdownButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => this.handleDropdownClick(e));
    });

    // Mobile subnav triggers & back buttons
    this.ui.mobileSubnavTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => this.openMobileSubnav(e));
    });

    this.ui.mobileSubnavBackBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => this.closeMobileSubnav(e));
    });

    this.ui.mobileSublistTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => this.toggleMobileSublist(e));
    });

    // Jump to content
    if (this.ui.jumpToContentBtn) {
      this.ui.jumpToContentBtn.addEventListener('click', () => {
        if (this.isMenuOpen) this.toggleMobileMenu();
        this.closeAllDropdowns();
      });
    }

    // Keyboard & outside click handling
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
    document.addEventListener('click', (e) => this.handleOutsideClick(e));

    if (this.el) {
      this.el.addEventListener('focusout', (e) => this.handleFocusOut(e));

      // Scroll progress bar
      if (this.ui.progressBar) {
        window.addEventListener(
          'scroll',
          throttle(() => this.handleScroll(), 10)
        );
        this.handleScroll();
      }
    }

    // Handle browser back/forward cache
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        if (this.isMenuOpen) this.toggleMobileMenu();
        this.closeAllDropdowns();
      }
    });
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      if (this.isMenuOpen) this.toggleMobileMenu();
      this.closeAllDropdowns();
    }
  }

  handleScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
    const isAtEnd = Math.round(percent) >= 100;

    if (scrollY <= 0 || isAtEnd) {
      this.el.classList.remove('uni-nav-article--progress-bar');
      this.lastScrollTop = scrollY;
    } else if (scrollY > this.lastScrollTop) {
      this.el.classList.add('uni-nav-article--progress-bar');
      this.lastScrollTop = scrollY;
    } else if (scrollY < this.lastScrollTop - 50) {
      this.el.classList.remove('uni-nav-article--progress-bar');
      this.lastScrollTop = scrollY;
    }

    if (this.ui.progressBar) {
      const clamped = Math.min(100, Math.max(0, percent));
      this.ui.progressBar.style.width = `${clamped}%`;
      this.ui.progressBar.setAttribute('aria-valuenow', String(Math.round(clamped)));
    }
  }

  handleSubscribeNewsletterClick(e) {
    const target = e.target;
    analyticsDispatcher.dispatch({
      event: SUBSCRIBE_CTA_EVENT,
      module_name: 'header',
      section_header: 'Navbar Menu',
      link_type: getLinkType(target),
      link_text: (target.innerText || '').trim(),
      link_url: SUBSCRIBE_URL,
      category: 'engagement',
      action: 'click',
      label: 'Newsletter Subscribe Navbar',
      contentType: this.el.dataset.contentType || 'homepage'
    });
  }

  toggleMobileMenu(focusFirst = false) {
    if (this.ui.menuBtns.length === 0) return;

    this.closeAllDropdowns();
    this.isMenuOpen = !this.isMenuOpen;

    this.ui.menuBtns.forEach((btn) => {
      btn.setAttribute('aria-expanded', String(this.isMenuOpen));
    });

    if (focusFirst) {
      if (this.isMenuOpen) {
        this.el.querySelector('.uni-nav__menu-btn--close')?.focus();
      } else {
        this.el.querySelector('.uni-nav__menu-btn--open')?.focus();
      }
    }

    if (this.ui.navMenu) {
      this.ui.navMenu.classList.toggle('uni-nav__nav--open', this.isMenuOpen);
    }
    this.ui.mobileMenu?.setAttribute('aria-hidden', String(!this.isMenuOpen));
    this.ui.mobileMenuOverlay?.setAttribute('aria-hidden', String(!this.isMenuOpen));

    if (!this.isMenuOpen) {
      this.ui.mobileSubnavTriggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
      this.el.querySelectorAll('.uni-nav-mobile-subnav').forEach((s) => s.setAttribute('aria-hidden', 'true'));
      this.el.querySelectorAll('.uni-nav-mobile-subnav__sublist').forEach((l) => l.setAttribute('aria-hidden', 'true'));
      this.ui.mobileSublistTriggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
      this.toggleMainSubnavInert(false);
    }

    this.bodyOverlayActive(this.isMenuOpen);
    this.el.dispatchEvent(new CustomEvent('nav-toggle', { detail: { open: this.isMenuOpen } }));
  }

  bodyOverlayActive(active) {
    document.body.classList.toggle(OVERFLOW_HIDDEN_MENU, active);
    Array.from(document.body.children).forEach((child) => {
      if (child !== this.el && !child.contains(this.el)) {
        if (active) {
          child.setAttribute('inert', '');
        } else {
          child.removeAttribute('inert');
        }
      }
    });
  }

  openMobileSubnav(e) {
    const trigger = e.currentTarget;
    const controlsId = trigger.getAttribute('aria-controls');
    if (controlsId) {
      const subnav = document.getElementById(controlsId);
      if (subnav) {
        subnav.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
        this.toggleMainSubnavInert(true);
        const backBtn = subnav.querySelector('.uni-nav-mobile-subnav__back-btn');
        backBtn?.focus();
      }
    }
  }

  toggleMobileSublist(e) {
    const trigger = e.currentTarget;
    const controlsId = trigger.getAttribute('aria-controls');
    if (controlsId) {
      const sublist = document.getElementById(controlsId);
      if (sublist) {
        const isHidden = sublist.getAttribute('aria-hidden') === 'true';
        sublist.setAttribute('aria-hidden', String(!isHidden));
        trigger.setAttribute('aria-expanded', String(isHidden));
      }
    }
  }

  closeMobileSubnav(e) {
    const subnav = e.currentTarget.closest('.uni-nav-mobile-subnav');
    if (subnav) {
      subnav.setAttribute('aria-hidden', 'true');
      const subnavId = subnav.getAttribute('id');
      let trigger = null;
      if (subnavId) {
        trigger = this.el.querySelector(`[aria-controls="${subnavId}"]`);
        trigger?.setAttribute('aria-expanded', 'false');
      }
      subnav.querySelectorAll('.uni-nav-mobile-subnav__sublist').forEach((l) => l.setAttribute('aria-hidden', 'true'));
      subnav.querySelectorAll('.uni-nav-mobile-subnav__sublist-trigger').forEach((t) => t.setAttribute('aria-expanded', 'false'));
      this.toggleMainSubnavInert(false);
      trigger?.focus();
    }
  }

  handleDropdownClick(e) {
    if (this.isMenuOpen) this.toggleMobileMenu();

    const trigger = e.currentTarget;
    const controlsId = trigger.getAttribute('aria-controls');
    const dropdown = controlsId ? document.getElementById(controlsId) : trigger.nextElementSibling;

    if (dropdown) {
      dropdown.style.setProperty('--nav-dropdowns-overflow', 'hidden');
      dropdown.addEventListener('transitionend', (evt) => {
        if (evt.propertyName === 'grid-template-rows') {
          dropdown.style.setProperty('--nav-dropdowns-overflow', 'auto');
        }
      });
    }

    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    this.closeAllDropdowns();

    if (!isExpanded && dropdown) {
      trigger.setAttribute('aria-expanded', 'true');
      dropdown.setAttribute('aria-hidden', 'false');
    }
  }

  closeAllDropdowns() {
    this.ui.dropdownButtons.forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
      const controlsId = btn.getAttribute('aria-controls');
      const dropdown = controlsId ? document.getElementById(controlsId) : btn.nextElementSibling;
      if (dropdown) dropdown.setAttribute('aria-hidden', 'true');
    });
  }

  toggleMainSubnavInert(inert) {
    if (this.ui.navMobileContainer) {
      Array.from(this.ui.navMobileContainer.children)
        .filter((child) => child.classList.contains('uni-nav-mobile__section'))
        .forEach((section) => {
          if (inert) {
            section.setAttribute('inert', '');
          } else {
            section.style.display = '';
            section.removeAttribute('inert');
          }
        });
    }
  }

  handleOutsideClick(e) {
    const target = e.target;
    if (target instanceof Node) {
      if (this.el.contains(target)) {
        const isDropdownBtn = Array.from(this.ui.dropdownButtons).some((btn) => btn.contains(target));
        const isDropdownMenu = Array.from(this.ui.dropdownButtons).some((btn) => {
          const id = btn.getAttribute('aria-controls');
          const menu = id ? document.getElementById(id) : btn.nextElementSibling;
          return menu && menu.contains(target);
        });
        if (!isDropdownBtn && !isDropdownMenu) {
          this.closeAllDropdowns();
        }
      } else {
        if (this.isMenuOpen) this.toggleMobileMenu();
        this.closeAllDropdowns();
      }
    }
  }

  handleFocusOut(e) {
    const related = e.relatedTarget;
    if (related instanceof Node) {
      if (this.el.contains(related)) {
        const isDropdownBtn = Array.from(this.ui.dropdownButtons).some((btn) => btn.contains(related));
        const isDropdownMenu = Array.from(this.ui.dropdownButtons).some((btn) => {
          const id = btn.getAttribute('aria-controls');
          const menu = id ? document.getElementById(id) : btn.nextElementSibling;
          return menu && menu.contains(related);
        });
        if (!isDropdownBtn && !isDropdownMenu) {
          this.closeAllDropdowns();
        }
      } else {
        if (this.isMenuOpen) this.toggleMobileMenu();
        this.closeAllDropdowns();
      }
    }
  }
}

export default HeaderComponent;
