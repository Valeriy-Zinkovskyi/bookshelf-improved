import axios from 'axios';
import { createRequestCache, ServiceCooldownError } from './request-cache.js';
import { categoryKey } from './catalog-data.js';

const api = axios.create({ baseURL: 'https://books-backend.p.goit.global/books/', timeout: 15000 });
let storage;
try { storage = globalThis.localStorage; } catch { /* Browser may block persistent storage. */ }
const cache = createRequestCache({ storage });
const isList = data => Array.isArray(data) && data.every(item => item && typeof item === 'object');
const isBook = data => data && typeof data === 'object' && typeof data._id === 'string';
function annotate(data, notice = '') {
  const copy = Array.isArray(data) ? [...data] : { ...data };
  copy.serviceNotice = notice;
  return copy;
}
async function list(path, params) {
  const key = path === 'category' ? `category:${params.category}` : path;
  const response = await cache.request(key, async () => (await api.get(path, { params })).data, isList);
  return annotate(response.data, response.stale ? 'The live book service is unavailable. Showing your last saved results.' : '');
}
function savedTopBooks() { return cache.peek('top-books', isList)?.data || []; }

export async function getCategoryList() {
  try { return await list('category-list'); }
  catch (error) {
    const groups = savedTopBooks().filter(group => group.list_name);
    if (!groups.length) throw error;
    return annotate(groups.map(group => ({ list_name: group.list_name })), 'Showing categories from your saved catalog.');
  }
}
export const getTopBooks = () => list('top-books');
export async function getCategory(category) {
  try { return await list('category', { category }); }
  catch (error) {
    const group = savedTopBooks().find(item => categoryKey(item.list_name) === categoryKey(category));
    if (!Array.isArray(group?.books) || !group.books.length) throw error;
    return annotate(group.books, 'The live book service is unavailable. Showing a saved selection for this category.');
  }
}
export async function getBooksById(id, fallbackBook) {
  try {
    const result = await cache.request(`book:${id}`, async () => (await api.get(encodeURIComponent(id))).data, isBook);
    return annotate(result.data, result.stale ? 'Showing saved book details. The live service is unavailable.' : '');
  } catch (error) {
    const saved = fallbackBook?._id === id ? fallbackBook : savedTopBooks().flatMap(group => group.books || []).find(book => book._id === id);
    if (!saved) throw error;
    return annotate(saved, 'Showing saved book details. The live service is unavailable.');
  }
}
export function serviceErrorMessage(error, subject) {
  if (error instanceof ServiceCooldownError) return 'The book service is temporarily limiting requests. Please wait about a minute before trying again.';
  return `Could not load ${subject}. The book service may be temporarily unavailable. Please try again later.`;
}
