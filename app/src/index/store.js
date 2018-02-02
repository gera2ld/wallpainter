import { ipcRenderer } from 'electron';

export const BASE_URL = 'http://127.0.0.1:19870';

export const store = {
  images: {},
  sources: [],
  search: {
    where: {
      status: '0',
    },
    per: 16,
    page: 1,
  },
  crawling: false,
};

ipcRenderer.on('crawl.status', (event, status) => {
  store.crawling = status;
});
