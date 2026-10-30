import fallbackCover from '../img/cover-unavailable.svg';

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function coverImage(book, className = 'bs-book-image') {
  const image = element('img', className);
  image.alt = `${book.title || 'Book'} cover`;
  image.width = 180;
  image.height = 256;
  image.loading = 'lazy';
  image.decoding = 'async';
  const source = book.book_image || book.image;
  let validSource;
  try { const url = new URL(source); if (url.protocol === 'https:') validSource = url.href; } catch { /* Missing external cover. */ }
  image.src = validSource || fallbackCover;
  image.addEventListener('error', () => {
    image.src = fallbackCover;
    image.alt = `Cover unavailable: ${book.title || 'Book'}`;
  }, { once: true });
  return image;
}

export function storeLinks(links) {
  const container = element('div', 'store-links');
  if (!Array.isArray(links)) return container;
  for (const item of links.slice(0, 3)) {
    try {
      const url = new URL(item.url);
      if (url.protocol !== 'https:') continue;
      const link = element('a', '', item.name || 'Book store');
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      container.append(link);
    } catch { /* Ignore invalid links from the external service. */ }
  }
  return container;
}
