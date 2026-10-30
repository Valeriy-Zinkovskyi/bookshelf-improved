import { getCategoryList } from './images-api.js';
import { uniqueCategories, categoryKey } from './catalog-data.js';
import { element } from './book-elements.js';
import { showCatalog } from './best-sellers.js';

const list = document.querySelector('.all-categories');
const status = document.querySelector('.category-status');

async function loadCategories() {
  status.replaceChildren();
  try {
    const categories = uniqueCategories(await getCategoryList());
    for (const category of categories) {
      const item = element('li');
      const button = element('button', 'list-category', category.list_name);
      button.type = 'button';
      button.dataset.category = category.list_name;
      item.append(button);
      list.append(item);
    }
  } catch {
    status.textContent = 'Categories unavailable. ';
    const retry = element('button', 'retry-button', 'Retry');
    retry.type = 'button';
    retry.addEventListener('click', loadCategories);
    status.append(retry);
  }
}
function select(name) {
  for (const button of list.querySelectorAll('[data-category]')) {
    const active = categoryKey(button.dataset.category) === categoryKey(name);
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  }
  showCatalog(name);
}
list.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (button) select(button.dataset.category);
});
document.addEventListener('bookshelf:category', event => {
  select(event.detail);
  document.querySelector('.catalog').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
loadCategories();
