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

export async function updateList() {
  store.images = await rpc('getList', store.search);
}
