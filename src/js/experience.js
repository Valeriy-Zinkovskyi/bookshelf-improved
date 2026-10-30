import { getShoppingList } from './shopping-storage.js';
import { element } from './book-elements.js';

const toast = element('div', 'toast');
toast.setAttribute('role', 'status');
toast.setAttribute('aria-live', 'polite');
document.body.append(toast);
let toastTimer;
export function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}
function updateCount() {
  try {
    const count = getShoppingList().length;
    document.querySelectorAll('.saved-count').forEach(badge => { badge.textContent = count; badge.hidden = count === 0; badge.setAttribute('aria-label', `${count} saved books`); });
  } catch { /* Keep the navigation usable with unavailable storage. */ }
}
document.addEventListener('bookshelf:saved-changed', updateCount);
window.addEventListener('storage', updateCount);
updateCount();
const progress = element('div', 'page-progress');
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);
let scheduled = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  const button = document.querySelector('#scroll-btn');
  if (button) button.hidden = scrollY < 500;
  scheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
window.addEventListener('resize', updateScroll);
updateScroll();
document.querySelector('#scroll-btn')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
const footer = element('footer', 'site-footer');
const brand = element('a', 'footer-brand', 'Bookshelf');
brand.href = './index.html';
const credit = element('a', 'cover-credit', 'Additional covers: Open Library');
credit.href = 'https://openlibrary.org/'; credit.target = '_blank'; credit.rel = 'noopener noreferrer';
footer.append(brand, element('p', '', 'One more book. A whole new world.'), credit);
document.body.append(footer);
