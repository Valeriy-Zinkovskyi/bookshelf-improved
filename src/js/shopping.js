import { getShoppingList, removeSavedBook, restoreSavedBook } from './shopping-storage.js';
import { element, coverImage, storeLinks } from './book-elements.js';
import { notify } from './experience.js';
const list = document.querySelector('.shopping-book-ul');
const empty = document.querySelector('.shopping-list-empty');
const status = document.querySelector('.shopping-status');
const undo = document.querySelector('.undo-removal');
let lastRemoved;
undo.querySelector('button').addEventListener('click', () => {
  if (!lastRemoved) return;
  try { restoreSavedBook(lastRemoved); lastRemoved = null; undo.hidden = true; render(); notify('Book restored to your collection'); }
  catch { status.textContent = 'Could not restore this book. Please allow browser storage.'; }
});

function render() {
  try {
    const books = getShoppingList();
    list.replaceChildren();
    status.textContent = '';
    empty.hidden = books.length > 0;
    for (const book of books) {
      const item = element('li', 'shopping-book-li');
      const remove = element('button', 'shopping-delete-btn', '×');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Remove ${book.title}`);
      remove.addEventListener('click', () => {
        try { removeSavedBook(book.id); lastRemoved = book; undo.hidden = false; undo.querySelector('span').textContent = `Removed “${book.title}”.`; render(); undo.querySelector('button').focus(); }
        catch { status.textContent = 'Could not remove this book. Please allow browser storage.'; }
      });
      const text = element('div', 'shopping-text-container');
      text.append(element('h2', 'shopping-book-title', book.title), element('p', 'shopping-book-genre', book.list_name || ''), element('p', 'shopping-book-descrip', book.description || 'No description is available for this book.'), element('p', 'author-book', book.author || 'Unknown author'), storeLinks(book.buy_links));
      item.append(coverImage(book, 'shopping-book-image'), text, remove);
      list.append(item);
    }
  } catch { status.textContent = 'Your saved list could not be read. Please check browser storage permissions.'; empty.hidden = true; }
}
window.addEventListener('storage', render);
render();
