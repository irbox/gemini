/**
 * Component Lifecycle Registry & Initializer
 * Reconstructed from Module 9557 in blog.google Webpack bundle
 */

/**
 * Helper to query elements as array
 */
const queryAll = (root, selector) => [...root.querySelectorAll(selector)];

/**
 * Initializes all elements with [data-component] using provided component mapping
 * @param {Object.<string, Function>} componentMap - Map of data-component name to class constructor
 * @param {Document|HTMLElement} root - Search container
 */
export function initializeComponents(componentMap, root = document) {
  window.G00G = window.G00G || {};
  const instances = window.G00G;

  queryAll(root, '[data-component]').forEach((el) => {
    const componentName = el.getAttribute('data-component');
    const ComponentClass = componentMap[componentName] || null;

    if (!ComponentClass || el.getAttribute('data-component-initialized')) {
      return;
    }

    try {
      const instance = new ComponentClass(el);
      instances[instance.id] = instance;
      instance.init();
      el.setAttribute('data-component-initialized', 'true');
    } catch (err) {
      console.error(`Failed to initialize component "${componentName}":`, err);
    }
  });

  // Call afterInit lifecycle hook
  Object.keys(instances).forEach((id) => {
    if (typeof instances[id].afterInit === 'function') {
      try {
        instances[id].afterInit();
      } catch (err) {
        console.error(`Error in afterInit for [${id}]:`, err);
      }
    }
  });
}

export default initializeComponents;
