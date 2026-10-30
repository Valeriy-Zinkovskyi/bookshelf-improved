// The API includes duplicate and empty category entries; normalize before rendering.
export const categoryKey = value => String(value || '').trim().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').toLowerCase();

export function uniqueCategories(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = categoryKey(item.list_name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => a.list_name.localeCompare(b.list_name));
}

export function uniqueBooks(items) {
  const seen = new Set();
  return items.filter(book => {
    if (!book?._id || !book.title) return false;
    const key = book.primary_isbn13 || `${categoryKey(book.title)}|${categoryKey(book.author)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function topCategories(items) {
  return uniqueCategories(items).map(group => ({ ...group, books: uniqueBooks(group.books || []).slice(0, 5) })).filter(group => group.books.length);
}
