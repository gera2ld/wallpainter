const fs = require('fs').promises;
const crypto = require('crypto');
const Crawler = require('crawler');
const { STATUS_ENABLED } = require('../consts');

class BingCrawler {
  constructor(handler) {
    this.handler = handler;
    this.options = handler.options;
    this.events = handler.events;
    this.crawler = new Crawler({
      jQuery: false,
      callback: (error, res, done) => {
        this.done += 1;
        this.notifyProgress();
        if (error) {
          console.error(error);
        } else {
          const data = JSON.parse(res.body);
          for (const image of data.images) {
            this.fetchImage(image);
          }
        }
        done();
      },
    });
    this.events.on('progress', (done, remain) => {
      console.info('Progress:', done, '/', done + remain);
    });
  }

  notifyProgress() {
    this.events.emit('progress', this.done, this.crawler.queueSize);
  }

  fetchImage(item) {
    const url = `https://cn.bing.com${item.url}`;
    const { db, dataDir } = this.options;
    if (db.get('images').find({ url }).value()) {
      console.info('[bing] Skipped existed:', url);
      return;
    }
    this.crawler.queue({
      uri: url,
      extra: item,
      encoding: null,
      jQuery: false,
      callback: async (error, res, done) => {
        const hash = crypto.createHash('md5');
        hash.update(res.body);
        const key = hash.digest('hex');
        await fs.writeFile(`${dataDir}/original/${key}.jpg`, res.body);
        console.info('[bing] Added image:', key);
        const imageItem = {
          key,
          url,
          status: STATUS_ENABLED,
          source: 'bing',
          extra: item,
        };
        db.get('images').push(imageItem).write();
        this.events.emit('imageAdd', imageItem);
        this.done += 1;
        this.notifyProgress();
        done();
      },
    });
  }

  start() {
    return new Promise((resolve) => {
      this.done = 0;
      this.crawler.queue('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=10');
      this.crawler.on('drain', () => {
        resolve();
        this.events.emit('finish');
      });
    });
  }
}

module.exports = BingCrawler;
