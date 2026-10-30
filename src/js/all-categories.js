import { getCategoryList, serviceErrorMessage } from './images-api.js';
import { uniqueCategories, categoryKey } from './catalog-data.js';
import { element } from './book-elements.js';
import { showCatalog } from './best-sellers.js';

const list = document.querySelector('.all-categories');
const status = document.querySelector('.category-status');
let selectionTimer;

async function loadCategories() {
  status.replaceChildren();
  try {
    const response = await getCategoryList();
    const categories = uniqueCategories(response);
    status.textContent = response.serviceNotice || '';
    for (const category of categories) {
      const item = element('li');
      const button = element('button', 'list-category', category.list_name);
      button.type = 'button';
      button.dataset.category = category.list_name;
      item.append(button);
      list.append(item);
    }
  } catch (error) {
    status.textContent = serviceErrorMessage(error, 'categories') + ' ';
    const retry = element('button', 'retry-button', 'Retry');
    retry.type = 'button';
    retry.addEventListener('click', loadCategories);
    status.append(retry);
  }
}
function markSelection(name) {
  for (const button of list.querySelectorAll('[data-category]')) {
    const active = categoryKey(button.dataset.category) === categoryKey(name);
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  }
}
function select(name) {
  markSelection(name);
  clearTimeout(selectionTimer);
  selectionTimer = setTimeout(() => showCatalog(name), 180);
}
list.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (button) select(button.dataset.category);
});
document.addEventListener('bookshelf:category', event => {
  select(event.detail);
  document.querySelector('.catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.addEventListener('bookshelf:selection-restored', event => markSelection(event.detail));
loadCategories();
