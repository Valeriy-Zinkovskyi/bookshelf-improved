import { getTopBooks, getCategory, serviceErrorMessage } from './images-api.js';
import { topCategories, uniqueBooks } from './catalog-data.js';
import { element, coverImage } from './book-elements.js';
import { openModal } from './modal-window.js';
import { getShoppingList, toggleSavedBook } from './shopping-storage.js';
import { filterBooks } from './catalog-controls.js';
import { notify } from './experience.js';

const catalog = document.querySelector('.book-category-list');
const title = document.querySelector('#catalog-title');
const status = document.querySelector('.catalog-status');
let requestNumber = 0;
let lastRenderedCategory = '';
let loadedGroups = [];
const controls = { query: '', sort: 'recommended', savedOnly: false };
const search = document.querySelector('#book-search');
const sort = document.querySelector('#book-sort');
const savedFilter = document.querySelector('.saved-filter');
const empty = document.querySelector('.catalog-empty');
const summary = document.querySelector('#results-summary');
let savedIds = new Set();
function readSaved() { try { savedIds = new Set(getShoppingList().map(book => book.id)); } catch { savedIds = new Set(); } }
readSaved();
function resetFilters() {
  controls.query = ''; controls.sort = 'recommended'; controls.savedOnly = false;
  search.value = ''; sort.value = 'recommended'; savedFilter.setAttribute('aria-pressed', 'false');
  renderCollection();
}
function renderCollection() {
  const fragment = document.createDocumentFragment();
  let count = 0;
  const filtered = controls.query.trim() || controls.sort !== 'recommended' || controls.savedOnly;
  for (const group of loadedGroups) {
    const books = filterBooks(group.books, { ...controls, savedIds });
    count += books.length;
    if (!books.length) continue;
    const section = element('section', 'book-category');
    const list = element('ul', `bs-book-list ${lastRenderedCategory || filtered ? 'category-book-grid' : 'bestseller-grid'}`);
    list.append(...books.map(card));
    if (!lastRenderedCategory) section.append(element('h2', 'bs-h3', group.list_name));
    section.append(list);
    if (!lastRenderedCategory && !filtered) {
      const more = element('button', 'see-more', 'Explore category →');
      more.type = 'button';
      more.setAttribute('aria-label', `See more in ${group.list_name}`);
      more.addEventListener('click', () => selectCategory(group.list_name));
      section.append(more);
    }
    fragment.append(section);
  }
  catalog.replaceChildren(fragment);
  empty.hidden = count > 0 || !loadedGroups.length;
  summary.textContent = loadedGroups.length ? `${count} ${count === 1 ? 'book' : 'books'} in ${lastRenderedCategory ? 'this category' : 'the bestseller selection'}${controls.query.trim() ? ' · matching your search' : ''}` : '';
  document.querySelector('.reset-filters').hidden = !filtered;
}
search.addEventListener('input', () => { controls.query = search.value; renderCollection(); });
sort.addEventListener('change', () => { controls.sort = sort.value; renderCollection(); });
savedFilter.addEventListener('click', () => { controls.savedOnly = !controls.savedOnly; savedFilter.setAttribute('aria-pressed', String(controls.savedOnly)); renderCollection(); });
document.querySelector('.reset-filters').addEventListener('click', resetFilters);
empty.querySelector('button').addEventListener('click', resetFilters);
document.querySelector('#catalog-search').addEventListener('submit', event => event.preventDefault());
document.addEventListener('keydown', event => {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) && !event.target.isContentEditable && !document.querySelector('dialog[open]')) { event.preventDefault(); search.focus(); }
});
document.addEventListener('bookshelf:saved-changed', () => {
  readSaved();
  if (controls.savedOnly) renderCollection();
  else catalog.querySelectorAll('.quick-save').forEach(button => reflectSave(button, button.dataset.id));
});
window.addEventListener('storage', () => { readSaved(); renderCollection(); });
function reflectSave(button, id) {
  const saved = savedIds.has(id);
  button.textContent = saved ? '♥' : '♡';
  button.setAttribute('aria-pressed', String(saved));
  button.setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${button.dataset.title}${saved ? ' from your list' : ' to your list'}`);
}
function skeleton() {
  const grid = element('div', 'bs-book-list skeleton-grid');
  grid.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 5; i++) grid.append(element('div', 'skeleton-card'));
  return grid;
}

function heading(name) {
  title.replaceChildren();
  const words = (name || 'Best Sellers Books').split(' ');
  const accent = words.pop();
  const prefix = words.length ? words.join(' ') + ' ' : '';
  title.append(document.createTextNode(prefix), element('span', '', accent));
}

function card(book) {
  const item = element('li', 'bs-book-item');
  const button = element('button', 'book-card');
  button.type = 'button';
  button.setAttribute('aria-label', `View ${book.title} by ${book.author || 'Unknown author'}`);
  const cover = element('span', 'book-cover');
  cover.append(coverImage(book), element('span', 'book-quick-view', 'Quick view'));
  const name = element('span', 'title-book', book.title);
  name.title = book.title;
  button.append(cover, name, element('span', 'author-book', book.author || 'Unknown author'));
  button.addEventListener('click', () => openModal(book));
  const save = element('button', 'quick-save');
  save.type = 'button'; save.dataset.id = book._id; save.dataset.title = book.title;
  reflectSave(save, book._id);
  save.addEventListener('click', () => {
    try { const saved = toggleSavedBook(book); notify(saved ? 'Added to your collection' : 'Removed from your collection'); }
    catch { notify('Could not save this book. Please allow browser storage.'); }
  });
  item.append(button, save);
  return item;
}

function selectCategory(name) {
  document.dispatchEvent(new CustomEvent('bookshelf:category', { detail: name }));
}

export async function showCatalog(category = '') {
  const current = ++requestNumber;
  catalog.setAttribute('aria-busy', 'true');
  status.textContent = 'Loading books…';
  if (!loadedGroups.length) catalog.replaceChildren(skeleton());
  try {
    if (category) {
      const response = await getCategory(category);
      const books = uniqueBooks(response);
      if (current !== requestNumber) return;
      heading(category);
      catalog.replaceChildren();
      lastRenderedCategory = category;
      loadedGroups = [{ list_name: category, books }];
      renderCollection();
      status.textContent = books.length ? (response.serviceNotice || '') : 'No books were found in this category.';
    } else {
      const response = await getTopBooks();
      const groups = topCategories(response);
      if (current !== requestNumber) return;
      heading('');
      catalog.replaceChildren();
      lastRenderedCategory = '';
      loadedGroups = groups;
      renderCollection();
      status.textContent = groups.length ? (response.serviceNotice || '') : 'No books are available right now.';
    }
  } catch (error) {
    if (current !== requestNumber) return;
    status.textContent = serviceErrorMessage(error, 'books') + ' ';
    if (loadedGroups.length) {
      status.append(document.createTextNode('Showing the previous selection. '));
      document.dispatchEvent(new CustomEvent('bookshelf:selection-restored', { detail: lastRenderedCategory }));
    }
    if (!loadedGroups.length) catalog.replaceChildren();
    const retry = element('button', 'retry-button', 'Try again');
    retry.type = 'button';
    retry.addEventListener('click', () => showCatalog(category));
    status.append(retry);
  } finally {
    if (current === requestNumber) catalog.setAttribute('aria-busy', 'false');
  }
}
