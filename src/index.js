import './js/header.js';
import './js/support.js';
import './js/all-categories.js';
import { showCatalog } from './js/best-sellers.js';

showCatalog();
const scrollButton = document.querySelector('#scroll-btn');
window.addEventListener('scroll', () => { scrollButton.hidden = window.scrollY < 500; }, { passive: true });
scrollButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
