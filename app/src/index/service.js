import { store } from './store';

let backend;

// function defer() {
//   const deferred = {};
//   deferred.promise = new Promise((resolve, reject) => {
//     deferred.resolve = resolve;
//     deferred.reject = reject;
//   });
//   return deferred;
// }

export async function rpc(method, params) {
  try {
    if (params == null) params = [];
    else if (!Array.isArray(params)) params = [params];
    const result = await backend[method](...params);
    if (process.env.NODE_ENV === 'development') {
      console.info('[rpc][success]', method, params, result);
    }
    return result;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[rpc][error]', method, params, err);
    }
  }
}

export function getWhere() {
  const where = {};
  const { status } = store.search.where;
  if (status) where.status = status;
  const sources = store.sources
  .filter(({ active }) => active)
  .map(({ source }) => source);
  if (sources.length) where.source = sources;
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

export async function initialize() {
  [backend] = await carlo.loadParams();
  await Promise.all([
    initSources(),
    updateList(),
  ]);
}

async function initSources() {
  const sources = await rpc('getSources');
  store.sources = sources.map(source => ({
    source,
    active: false,
  }));
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
