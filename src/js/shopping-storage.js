export function getShoppingList() {
  const raw = localStorage.getItem('shoppingList');
  if (!raw) return [];
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) throw new Error('The saved shopping list could not be read.');
  return items.filter(book => book && book.id && book.title);
}
export function toggleSavedBook(book) {
  const list = getShoppingList();
  const index = list.findIndex(item => item.id === book._id);
  if (index === -1) list.push({ id: book._id, title: book.title, author: book.author, image: book.book_image, primary_isbn13: book.primary_isbn13, primary_isbn10: book.primary_isbn10, description: book.description, buy_links: book.buy_links, list_name: book.list_name });
  else list.splice(index, 1);
  localStorage.setItem('shoppingList', JSON.stringify(list));
  globalThis.document?.dispatchEvent(new CustomEvent('bookshelf:saved-changed'));
  return index === -1;
}
export function removeSavedBook(id) {
  localStorage.setItem('shoppingList', JSON.stringify(getShoppingList().filter(book => book.id !== id)));
  globalThis.document?.dispatchEvent(new CustomEvent('bookshelf:saved-changed'));
}

export function restoreSavedBook(book) {
  const list = getShoppingList();
  if (!list.some(item => item.id === book.id)) list.push(book);
  localStorage.setItem('shoppingList', JSON.stringify(list));
  globalThis.document?.dispatchEvent(new CustomEvent('bookshelf:saved-changed'));
}
