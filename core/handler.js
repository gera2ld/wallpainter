const fs = require('fs').promises;
const EventEmitter = require('events');
const BingCrawler = require('./spiders/bing');
const { wrapError, ignoreErrorCode } = require('./util');
const { STATUS_DISABLED } = require('./consts');

class Handler {
  constructor(options) {
    this.options = options;
    this.events = new EventEmitter();
    const { dataDir } = options;
    this.linkImage = wrapError(
      key => fs.link(`${dataDir}/original/${key}.jpg`, `${dataDir}/selected/${key}.jpg`),
      ignoreErrorCode('EEXIST'),
    );
    this.unlinkImage = wrapError(
      key => fs.unlink(`${dataDir}/selected/${key}.jpg`),
      ignoreErrorCode('ENOENT'),
    );
    this.events.on('imageAdd', (item) => {
      this.buildSelected(item);
    });
  }

  getSources() {
    return this.options.db.get('images').map('source').uniq().value();
  }

  getList({ per = 10, offset = 0, where }) {
    const { db } = this.options;
    const { source, ...rest } = where || {};
    const filtered = db.get('images')
    .filter((item) => {
      const { _ } = db;
      return (!source || _.includes(source, item.source)) && _.isMatch(item, rest);
    });
    const total = filtered.size().value();
    const rows = filtered.slice(offset, offset + per).value();
    console.info(`[getList] where=${JSON.stringify(where)}`);
    return { total, rows, offset, per };
  }

  async buildSelected({ key, status }) {
    const enabled = status !== STATUS_DISABLED;
    if (enabled) {
      await this.linkImage(key);
    } else {
      await this.unlinkImage(key);
    }
  }

  async setItem(update) {
    await this.options.db.get('images')
    .find({ key: update.key })
    .assign(update)
    .write();
    const { status } = update;
    if (status) this.buildSelected(update);
  }

  async crawl() {
    await new BingCrawler(this).start();
  }

  async buildAllSelected() {
    const items = this.options.db.get('images').value();
    return Promise.all(items.map(item => this.buildSelected(item)));
  }
}

module.exports = Handler;
