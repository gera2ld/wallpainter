import axios from 'axios';
import { BASE_URL, store } from './store';

const URL_API = `${BASE_URL}/api`;

export async function rpc(method, params) {
  if (process.env.NODE_ENV === 'development') {
    console.info('RPC request:', method, params);
  }
  const { data } = await axios.post(URL_API, {
    method,
    params,
  });
  if (process.env.NODE_ENV === 'development') {
    console.info('RPC response:', data);
  }
  if (data.success) return data.data;
  throw data.error;
}

export function getWhere() {
  const where = {};
  const { status } = store.search.where;
  if (status) where.status = +status || 0;
  return where;
}

async function loadPage() {
  const search = {
    per: store.search.per,
    offset: store.search.offset,
    where: getWhere(),
  };
  return rpc('getList', search);
}

export async function updateList() {
  store.search.offset = 0;
  const images = await loadPage();
  store.search.offset = images.offset + images.rows.length;
  store.images = images;
}

export async function loadMore() {
  if (store.search.offset < store.images.total) {
    const images = await loadPage();
    store.search.offset = images.offset + images.rows.length;
    images.rows = store.images.rows.slice(0, images.offset).concat(images.rows);
    store.images = images;
  }
}
