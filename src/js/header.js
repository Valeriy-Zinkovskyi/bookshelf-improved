const toggle = document.querySelector('#theme-toggle');
const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-toggle');
let dark = false;
try { dark = localStorage.getItem('bookshelfTheme') === 'dark'; } catch { /* Theme still works without storage. */ }
function applyTheme() {
  document.body.classList.toggle('dark-theme', toggle.checked);
  document.documentElement.style.colorScheme = toggle.checked ? 'dark' : 'light';
}
toggle.checked = dark;
applyTheme();
toggle.addEventListener('change', () => {
  applyTheme();
  try { localStorage.setItem('bookshelfTheme', toggle.checked ? 'dark' : 'light'); } catch { /* Storage may be blocked. */ }
});
const shopping = location.pathname.endsWith('shopping.html');
document.querySelector(shopping ? '.link-shopping' : '.link-home').setAttribute('aria-current', 'page');
function closeMenu() {
  header.classList.remove('menu-open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
}
menu.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
