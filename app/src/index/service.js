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
    // const res = await fetch('/api', {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     method,
    //     params,
    //   }),
    // });
    // const { data, error } = await res.json();
    // if (error) throw error;
    const data = await backend[method](...params);
    if (process.env.NODE_ENV === 'development') {
      console.info('[rpc][success]', method, params, data);
    }
    return data;
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
  if (window.require) {
    // Electron
    backend = window.require('electron').remote.getGlobal('wallPainterHandler');
  } else if (typeof carlo !== 'undefined') {
    // Carlo
    [backend] = await carlo.loadParams();
  }
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
