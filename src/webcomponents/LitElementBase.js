/**
 * Lightweight Custom Elements / Web Components Registry
 * Reconstructed from Module 9553 in blog.google Webpack bundle
 */

/**
 * Base custom element with reactive property observation
 */
export class UniCustomElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {}
}

/**
 * Custom Element: <uni-cta>
 */
export class UniCta extends UniCustomElement {
  static get observedAttributes() {
    return ['emphasis', 'href'];
  }

  connectedCallback() {
    const emphasis = this.getAttribute('emphasis') || 'medium';
    this.classList.add('uni-cta', `uni-cta--${emphasis}`);
  }
}

/**
 * Custom Element: <uni-flex-card>
 */
export class UniFlexCard extends UniCustomElement {
  connectedCallback() {
    this.classList.add('uni-flex-card-host');
  }
}

/**
 * Custom Element: <uni-portal>
 */
export class UniPortal extends UniCustomElement {
  connectedCallback() {
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'true');
  }
}

/**
 * Register all Google Blog custom elements
 */
export function registerWebComponents() {
  if (typeof customElements === 'undefined') return;

  const components = {
    'uni-cta': UniCta,
    'uni-flex-card': UniFlexCard,
    'uni-portal': UniPortal
  };

  for (const [tag, cls] of Object.entries(components)) {
    if (!customElements.get(tag)) {
      customElements.define(tag, cls);
    }
  }
}

export default registerWebComponents;
