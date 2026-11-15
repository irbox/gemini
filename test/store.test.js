import test from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../src/core/Store.js';

test('Store - dispatch and subscribe', () => {
  const store = new Store();
  const received = [];

  store.subscribe('sub1', (payload) => {
    received.push(payload);
  });

  store.dispatch('TEST_ACTION', { foo: 'bar' });

  assert.equal(received.length, 1);
  assert.deepEqual(received[0], {
    type: 'TEST_ACTION',
    data: { foo: 'bar' }
  });
});

test('Store - unsubscribe', () => {
  const store = new Store();
  let count = 0;

  store.subscribe('sub1', () => {
    count++;
  });

  store.dispatch('EVENT_1');
  assert.equal(count, 1);

  store.unsubscribe('sub1');
  store.dispatch('EVENT_2');
  assert.equal(count, 1);
});

test('Store - setState and getState', () => {
  const store = new Store();
  let stateNotification = null;

  store.subscribe('stateWatcher', (payload) => {
    stateNotification = payload;
  });

  store.setState('isCookieBannerVisible', true);

  assert.equal(store.getState('isCookieBannerVisible'), true);
  assert.deepEqual(stateNotification, {
    type: 'STATE_CHANGED/ISCOOKIEBANNERVISIBLE',
    data: { key: 'isCookieBannerVisible', value: true }
  });
});
