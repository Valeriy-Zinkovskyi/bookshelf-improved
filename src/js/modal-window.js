import { getBooksById } from './images-api.js';
import { element, coverImage, storeLinks } from './book-elements.js';
import { getShoppingList, toggleSavedBook } from './shopping-storage.js';

const dialog = document.querySelector('.book-dialog');
const body = dialog?.querySelector('.dialog-body');
let activeRequest = 0;
let previousFocus;

dialog?.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => { if (event.target === dialog && (event.clientX < dialog.getBoundingClientRect().left || event.clientX > dialog.getBoundingClientRect().right || event.clientY < dialog.getBoundingClientRect().top || event.clientY > dialog.getBoundingClientRect().bottom)) dialog.close(); });
dialog?.addEventListener('close', () => {
  activeRequest++;
  document.body.classList.remove('modal-open');
  previousFocus?.focus();
});

export async function openModal(book) {
  if (!dialog) return;
  previousFocus = document.activeElement;
  const current = ++activeRequest;
  body.replaceChildren(element('h2', '', 'Loading book details…'));
  body.firstChild.id = 'modal-title';
  if (!dialog.open) dialog.showModal();
  document.body.classList.add('modal-open');
  try {
    const details = await getBooksById(book._id);
    if (current !== activeRequest || !dialog.open) return;
    const content = element('div', 'dialog-content');
    const text = element('div', 'dialog-text');
    const title = element('h2', '', details.title);
    title.id = 'modal-title';
    text.append(title, element('p', 'author-book', details.author || 'Unknown author'), element('p', 'dialog-description', details.description || 'No description is available for this book.'), storeLinks(details.buy_links));
    const cover = coverImage(details, 'dialog-cover');
    cover.loading = 'eager';
    content.append(cover, text);
    const save = element('button', 'save-book');
    save.type = 'button';
    const message = element('p', 'save-status');
    message.setAttribute('role', 'status');
    function reflectSaved() {
      try {
        const saved = getShoppingList().some(item => item.id === details._id);
        save.textContent = saved ? 'Remove from the shopping list' : 'Add to shopping list';
        save.setAttribute('aria-pressed', String(saved));
      } catch {
        save.textContent = 'Add to shopping list';
        message.textContent = 'Your saved list is unavailable in this browser.';
      }
    }
    reflectSaved();
    save.addEventListener('click', () => {
      try {
        const saved = toggleSavedBook(details);
        reflectSaved();
        message.textContent = saved ? 'Book saved. Find it in your shopping list.' : 'Book removed from your shopping list.';
      } catch { message.textContent = 'Could not save changes. Please allow browser storage.'; }
    });
    body.replaceChildren(content, save, message);
  } catch {
    if (current !== activeRequest || !dialog.open) return;
    const title = element('h2', '', 'Book details unavailable');
    title.id = 'modal-title';
    const retry = element('button', 'retry-button', 'Try again');
    retry.type = 'button';
    retry.addEventListener('click', () => openModal(book));
    body.replaceChildren(title, element('p', '', 'Please check your connection and try again.'), retry);
  }
}
