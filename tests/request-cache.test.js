import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequestCache, ServiceCooldownError } from '../src/js/request-cache.js';
const valid = Array.isArray;
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};

test('repeated and simultaneous reads share one request, including after navigation', async () => {
  const saved = storage();
  let calls = 0, release;
  const cache = createRequestCache({ storage: saved });
  const load = () => { calls++; return new Promise(resolve => { release = resolve; }); };
  const one = cache.request('top-books', load, valid);
  const two = cache.request('top-books', load, valid);
  await Promise.resolve();
  release([{ title: 'One' }]);
  assert.deepEqual(await one, await two);
  await cache.request('top-books', load, valid);
  const afterNavigation = createRequestCache({ storage: saved });
  await afterNavigation.request('top-books', load, valid);
  assert.equal(calls, 1);
});

test('expired cached results survive a service outage and are marked stale', async () => {
  let clock = 1000;
  const saved = storage();
  const cache = createRequestCache({ storage: saved, now: () => clock, ttl: 10 });
  await cache.request('category', async () => [{ title: 'Saved book' }], valid);
  clock += 20;
  const result = await cache.request('category', async () => { throw Error('offline'); }, valid);
  assert.equal(result.stale, true);
  assert.equal(result.data[0].title, 'Saved book');
});

test('wrapped 429 starts a shared cooldown that survives navigation, then permits recovery', async () => {
  let clock = 1000, calls = 0;
  const saved = storage();
  const options = { storage: saved, now: () => clock, cooldownMs: 100 };
  const fail = async () => { calls++; throw { response: { status: 500, data: { message: 'Request failed with status code 429' } } }; };
  const cache = createRequestCache(options);
  await assert.rejects(cache.request('one', fail, valid), ServiceCooldownError);
  await assert.rejects(cache.request('two', fail, valid), ServiceCooldownError);
  const reloaded = createRequestCache(options);
  await assert.rejects(reloaded.request('three', fail, valid), ServiceCooldownError);
  assert.equal(calls, 1);
  clock += 101;
  const result = await reloaded.request('three', async () => ['Recovered'], valid);
  assert.deepEqual(result.data, ['Recovered']);
});

test('invalid responses are never cached and synchronous failures do not poison retries', async () => {
  const cache = createRequestCache();
  await assert.rejects(cache.request('bad', () => { throw Error('bad'); }, valid));
  const ok = await cache.request('bad', async () => ['Valid'], valid);
  assert.deepEqual(ok.data, ['Valid']);
  await assert.rejects(cache.request('html', async () => '<html>Error</html>', valid));
  assert.equal(cache.peek('html', valid), null);
});

test('denied storage does not prevent normal requests or in-memory caching', async () => {
  let calls = 0;
  const cache = createRequestCache({ storage: { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } } });
  const load = async () => { calls++; return []; };
  await cache.request('one', load, valid);
  await cache.request('one', load, valid);
  assert.equal(calls, 1);
});
