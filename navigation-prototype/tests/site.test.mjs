import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const root = new URL('../dist/', import.meta.url);

test('homepage sends Find Your Ritual to the dedicated shop page', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  assert.match(html, /href="shop\.html"[^>]*>FIND YOUR RITUAL/);
  assert.doesNotMatch(html, /id="productGrid"/);
});

test('shop page owns the complete catalogue and a back control', async () => {
  const html = await readFile(new URL('shop.html', root), 'utf8').catch(() => '');
  assert.match(html, /id="productGrid"/);
  assert.match(html, /data-back/);
});

test('one global filter replaces any previous category selection', async () => {
  const moduleUrl = pathToFileURL(new URL('catalog.mjs', root).pathname).href;
  const catalog = await import(moduleUrl).catch(() => null);
  assert.ok(catalog, 'catalog filter module should exist');

  const afterTime = catalog.selectFilter(null, 'time', 'Morning');
  const afterNeed = catalog.selectFilter(afterTime, 'need', 'Digest & Ease');
  assert.deepEqual(afterNeed, { group: 'need', value: 'Digest & Ease' });
});

test('a selected category returns every matching product', async () => {
  const moduleUrl = pathToFileURL(new URL('catalog.mjs', root).pathname).href;
  const catalog = await import(moduleUrl).catch(() => null);
  assert.ok(catalog, 'catalog filter module should exist');

  const names = catalog.filterProducts(catalog.products, {
    group: 'time',
    value: 'Morning',
  }).map((product) => product.name);

  assert.deepEqual(names, [
    'Morning Signal',
    'Daily Flow',
    'Clear Focus',
    'Peak Focus',
    'Berry Hydrate',
  ]);
});

test('visual certification badges appear selectively rather than on every product', async () => {
  const moduleUrl = pathToFileURL(new URL('catalog.mjs', root).pathname).href;
  const { products } = await import(moduleUrl);
  const badged = products.filter((product) => product.badges?.length);

  assert.ok(badged.some((product) => product.badges.includes('CAFFEINE FREE')));
  assert.ok(badged.some((product) => product.badges.includes('ORGANIC')));
  assert.ok(badged.length < products.length);
});
