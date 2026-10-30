// Search is deliberately scoped to the selected, loaded collection.
export function filterBooks(books, { query = '', sort = 'recommended', savedOnly = false, savedIds = new Set() } = {}) {
  const needle = query.trim().toLocaleLowerCase();
  const result = books.filter(book => (!savedOnly || savedIds.has(book._id)) &&
    (!needle || `${book.title || ''} ${book.author || ''}`.toLocaleLowerCase().includes(needle)));
  if (sort === 'title' || sort === 'author') result.sort((a, b) =>
    (a[sort] || '').localeCompare(b[sort] || '', 'en', { sensitivity: 'base' }) || (a.title || '').localeCompare(b.title || ''));
  return result;
}
