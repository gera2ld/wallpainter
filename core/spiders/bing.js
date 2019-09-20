const fs = require('fs').promises;
const crypto = require('crypto');
const Crawler = require('crawler');

class BingCrawler {
  constructor(db) {
    this.db = db;
    this.crawler = new Crawler({
      jQuery: false,
      callback: (error, res, done) => {
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
  }

  fetchImage(item) {
    const url = `https://cn.bing.com${item.url}`;
    if (this.db.get('images').find({ url }).value()) {
      console.info('[bing] Skipped existed:', url);
      return;
    }
    this.crawler.queue({
      uri: url,
      extra: item,
      encoding: null,
      jQuery: false,
      callback: async (error, res, done) => {
        this.notifyProgress();
        const hash = crypto.createHash('md5');
        hash.update(res.body);
        const key = hash.digest('hex');
        await fs.writeFile(`data/original/${key}.jpg`, res.body);
        console.info('[bing] Added image:', key);
        this.db.get('images').push({
          key,
          url,
          status: 0,
          source: 'bing',
          extra: item,
        }).write();
        done();
      },
    });
  }

  notifyProgress() {
    this.done += 1;
    console.info('Progress:', this.done, '/', this.done + this.crawler.queueSize);
    if (this.callback) {
      this.callback({
        done: this.done,
        remain: this.crawler.queueSize,
      });
    }
  }

  start(callback) {
    return new Promise((resolve) => {
      this.done = 0;
      this.crawler.queue('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=10');
      this.callback = callback;
      this.crawler.on('drain', () => {
        this.callback = null;
        resolve();
        console.info('Finished');
      });
    });
  }
}

module.exports = BingCrawler;
