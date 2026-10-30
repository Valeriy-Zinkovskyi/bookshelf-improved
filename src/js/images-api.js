import axios from 'axios';

const api = axios.create({ baseURL: 'https://books-backend.p.goit.global/books/', timeout: 15000 });
async function getList(path, params) {
  const { data } = await api.get(path, { params });
  if (!Array.isArray(data)) throw new Error('The book service returned an invalid list.');
  return data;
}
export const getCategoryList = () => getList('category-list');
export const getTopBooks = () => getList('top-books');
export const getCategory = category => getList('category', { category });
export async function getBooksById(id) {
  const { data } = await api.get(encodeURIComponent(id));
  if (!data?._id) throw new Error('Book details are unavailable.');
  return data;
}
