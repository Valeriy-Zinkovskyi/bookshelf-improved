import { getTopBooks, getCategory } from './images-api.js';
import { topCategories, uniqueBooks } from './catalog-data.js';
import { element, coverImage } from './book-elements.js';
import { openModal } from './modal-window.js';

const catalog = document.querySelector('.book-category-list');
const title = document.querySelector('#catalog-title');
const status = document.querySelector('.catalog-status');
let requestNumber = 0;

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
  item.append(button);
  return item;
}

function selectCategory(name) {
  document.dispatchEvent(new CustomEvent('bookshelf:category', { detail: name }));
}

export async function showCatalog(category = '') {
  const current = ++requestNumber;
  heading(category);
  catalog.replaceChildren();
  catalog.setAttribute('aria-busy', 'true');
  status.textContent = 'Loading books…';
  try {
    if (category) {
      const books = uniqueBooks(await getCategory(category));
      if (current !== requestNumber) return;
      const list = element('ul', 'bs-book-list category-book-grid');
      list.append(...books.map(card));
      catalog.append(list);
      status.textContent = books.length ? '' : 'No books were found in this category.';
    } else {
      const groups = topCategories(await getTopBooks());
      if (current !== requestNumber) return;
      for (const group of groups) {
        const section = element('section', 'book-category');
        const list = element('ul', 'bs-book-list bestseller-grid');
        list.append(...group.books.map(card));
        const more = element('button', 'see-more', 'See more');
        more.type = 'button';
        more.setAttribute('aria-label', `See more in ${group.list_name}`);
        more.addEventListener('click', () => selectCategory(group.list_name));
        section.append(element('h2', 'bs-h3', group.list_name), list, more);
        catalog.append(section);
      }
      status.textContent = groups.length ? '' : 'No books are available right now.';
    }
  } catch {
    if (current !== requestNumber) return;
    status.textContent = 'Could not load books. Please check your connection and try again. ';
    const retry = element('button', 'retry-button', 'Try again');
    retry.type = 'button';
    retry.addEventListener('click', () => showCatalog(category));
    status.append(retry);
  } finally {
    if (current === requestNumber) catalog.setAttribute('aria-busy', 'false');
  }
}
