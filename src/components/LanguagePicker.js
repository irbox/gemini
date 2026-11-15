/**
 * Language Picker & Dropdown Component
 * Reconstructed from Chunk 2235 and Module 852 in blog.google Webpack bundle
 */

import { BaseComponent } from '../core/BaseComponent.js';

export class LanguagePickerComponent extends BaseComponent {
  constructor(element) {
    super(element);
    this.isOpen = false;
  }

  _elements() {
    this.ui = {
      ...this.loadElements({
        trigger: '.uni-dropdown__trigger, button[aria-haspopup="listbox"]',
        menu: '.uni-dropdown__menu, [role="listbox"]',
        selectedLabel: '.uni-dropdown__selected-text'
      }),
      options: this.el.querySelectorAll('.uni-dropdown__option, [role="option"]')
    };
  }

  _events() {
    if (this.ui.trigger) {
      this.ui.trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });
    }

    this.ui.options.forEach((opt) => {
      opt.addEventListener('click', (e) => this.selectOption(e));
    });

    document.addEventListener('click', (e) => {
      if (!this.el.contains(e.target) && this.isOpen) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.ui.trigger?.setAttribute('aria-expanded', 'true');
    this.ui.menu?.classList.add('uni-dropdown__menu--open');
    this.ui.menu?.removeAttribute('hidden');
  }

  close() {
    this.isOpen = false;
    this.ui.trigger?.setAttribute('aria-expanded', 'false');
    this.ui.menu?.classList.remove('uni-dropdown__menu--open');
    this.ui.menu?.setAttribute('hidden', '');
  }

  selectOption(e) {
    const opt = e.currentTarget;
    const value = opt.dataset.value || opt.textContent.trim();
    if (this.ui.selectedLabel) {
      this.ui.selectedLabel.textContent = opt.textContent.trim();
    }

    this.ui.options.forEach((o) => {
      o.setAttribute('aria-selected', String(o === opt));
    });

    this.close();
    this.el.dispatchEvent(new CustomEvent('language-change', { detail: { locale: value } }));
  }
}

export default LanguagePickerComponent;
