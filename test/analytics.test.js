import test from 'node:test';
import assert from 'node:assert/strict';

// Set up minimal browser environment mock for Node
globalThis.window = {
  dataLayer: [],
  dispatchEvent: () => {},
  CustomEvent: class CustomEvent {
    constructor(type, eventInitDict) {
      this.type = type;
      this.detail = eventInitDict?.detail;
    }
  }
};
globalThis.CustomEvent = globalThis.window.CustomEvent;

const { AnalyticsDispatcher } = await import('../src/analytics/AnalyticsDispatcher.js');

test('AnalyticsDispatcher - Twitter handle redaction', () => {
  const dispatcher = new AnalyticsDispatcher();
  assert.equal(
    dispatcher.removeTwitterHandles('Follow @sundarpichai on Twitter!'),
    'Follow <Twitter Handle> on Twitter!'
  );
  assert.equal(
    dispatcher.removeTwitterHandles('Visit twitter.com/Google for updates'),
    'Visit twitter.com/twitter-handle for updates'
  );
});

test('AnalyticsDispatcher - Format and validate attributes', () => {
  const dispatcher = new AnalyticsDispatcher();
  const formatted = dispatcher.formatData({
    event: 'article_click',
    category: 'feed'
  });

  assert.equal(formatted.event, 'article_click');
  assert.equal(formatted.category, 'feed');
  assert.equal(formatted.action, 'undefined');
  assert.equal(formatted.label, 'undefined');
  assert.equal(formatted.contentType, 'undefined');
});

test('AnalyticsDispatcher - Diff event data against previous state', () => {
  const dispatcher = new AnalyticsDispatcher();
  const prev = { event: 'page_view', category: 'nav', oldKey: 'oldValue' };
  const curr = { event: 'cta_click', category: 'nav', newKey: 'newValue' };

  const diffed = dispatcher.diffEventData(prev, curr);
  assert.equal(diffed.event, 'cta_click');
  assert.equal(diffed.category, 'nav');
  assert.equal(diffed.oldKey, undefined);
  assert.equal(diffed.newKey, 'newValue');
});
