import test from 'node:test';
import assert from 'node:assert/strict';
import { uniqueCategories, uniqueBooks, topCategories } from '../src/js/catalog-data.js';
import { getShoppingList, toggleSavedBook, removeSavedBook } from '../src/js/shopping-storage.js';

test('API categories drop empty names and apostrophe variants without changing the original query name', () => {
  const result = uniqueCategories([{ list_name: '' }, { list_name: "Children’s Books" }, { list_name: "Children's Books" }, { list_name: 'Business' }]);
  assert.deepEqual(result.map(item => item.list_name), ['Business', 'Children’s Books']);
});

test('duplicate API book records do not create duplicate cards', () => {
  const original = { _id: 'one', title: 'A book', author: 'Writer', primary_isbn13: '9780000000001' };
  assert.deepEqual(uniqueBooks([original, { ...original, _id: 'two' }, { _id: 'invalid' }]), [original]);
  assert.equal(uniqueBooks([{ _id: 'a', title: 'Book', author: 'Writer' }, { _id: 'b', title: 'BOOK', author: 'writer' }]).length, 1);
});

test('home sections exclude empty categories and cap unique books at five', () => {
  const books = Array.from({ length: 8 }, (_, n) => ({ _id: String(n), title: 'Book ' + n, author: 'Writer' }));
  const groups = topCategories([{ list_name: '', books }, { list_name: 'Business', books }, { list_name: 'Fiction', books: [] }]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].books.length, 5);
});

test('saving two books then removing one preserves the other and rejects corrupt storage', () => {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const one = { _id: 'one', title: 'First', author: 'A', book_image: '', buy_links: [] };
  const two = { _id: 'two', title: 'Second', author: 'B', book_image: '', buy_links: [] };
  assert.equal(toggleSavedBook(one), true);
  assert.equal(toggleSavedBook(two), true);
  assert.deepEqual(getShoppingList().map(book => book.id), ['one', 'two']);
  assert.equal(toggleSavedBook(one), false);
  assert.deepEqual(getShoppingList().map(book => book.id), ['two']);
  removeSavedBook('two');
  assert.deepEqual(getShoppingList(), []);
  values.set('shoppingList', '{broken');
  assert.throws(() => toggleSavedBook(one));
  assert.equal(values.get('shoppingList'), '{broken');
});
