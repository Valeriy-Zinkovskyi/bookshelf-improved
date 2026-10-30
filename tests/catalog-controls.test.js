import test from 'node:test';
import assert from 'node:assert/strict';
import { filterBooks } from '../src/js/catalog-controls.js';
const books = [
  { _id: 'a', title: 'The Night', author: 'Zoë Smith' },
  { _id: 'b', title: 'A New Day', author: 'Amir' },
  { _id: 'c', title: 'Night Stories', author: 'Bea' },
];
test('search combines title and author, ignores case and surrounding spaces', () => {
  assert.deepEqual(filterBooks(books, { query: ' NIGHT ' }).map(b => b._id), ['a', 'c']);
  assert.deepEqual(filterBooks(books, { query: 'zoë' }).map(b => b._id), ['a']);
  assert.equal(filterBooks(books, { query: 'missing' }).length, 0);
});
test('saved filtering and sorting compose without mutating API order', () => {
  assert.deepEqual(filterBooks(books, { sort: 'title' }).map(b => b._id), ['b', 'c', 'a']);
  assert.deepEqual(filterBooks(books, { savedOnly: true, savedIds: new Set(['a', 'c']), sort: 'author' }).map(b => b._id), ['c', 'a']);
  assert.deepEqual(books.map(b => b._id), ['a', 'b', 'c']);
  assert.equal(filterBooks(books, { savedOnly: true }).length, 0);
});
