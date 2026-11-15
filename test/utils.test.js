import test from 'node:test';
import assert from 'node:assert/strict';
import { generateId, getLinkType } from '../src/core/utils.js';

test('utils - generateId creates unique ids', () => {
  const id1 = generateId();
  const id2 = generateId();
  assert.notEqual(id1, id2);
  assert.match(id1, /^\d+_\d+$/);
});

test('utils - getLinkType classifies properly', () => {
  const mockElement = (href) => ({
    getAttribute: (attr) => (attr === 'href' ? href : null)
  });

  assert.equal(getLinkType(null), 'unknown');
  assert.equal(getLinkType(mockElement('mailto:press@google.com')), 'email');
  assert.equal(getLinkType(mockElement('tel:+18005550199')), 'phone');
  assert.equal(getLinkType(mockElement('#main-content')), 'anchor');
  assert.equal(getLinkType(mockElement('/technology/ai/')), 'internal');
  assert.equal(getLinkType(mockElement('https://blog.google/products/pixel/')), 'internal');
  assert.equal(getLinkType(mockElement('https://twitter.com/google')), 'external');
});
