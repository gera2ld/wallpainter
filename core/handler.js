const BingCrawler = require('./spiders/bing');

class Handler {
  constructor(db) {
    this.db = db;
  }

  getSources() {
    return this.db.get('images').map('source').uniq().value();
  }

  getList({ per = 10, offset = 0, where }) {
    const { source, ...rest } = where || {};
    const filtered = this.db.get('images')
    .filter((item) => {
      const { _ } = this.db;
      return (!source || _.includes(source, item.source)) && _.isMatch(item, rest);
    });
    const total = filtered.size().value();
    const rows = filtered.slice(offset, offset + per).value();
    console.info(`[getList] where=${JSON.stringify(where)}`);
    return { total, rows, offset, per };
  }

  setItem(key, update) {
    return this.db.get('images').find({ key }).assign(update).write();
  }

  async crawl() {
    await new BingCrawler(this.db).start();
  }
}

module.exports = Handler;
