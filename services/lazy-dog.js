const initializeWP = require('../core');

const GAP = 24 * 60 * 60 * 1000;
const CONFIG_LAST_CRAWL = 'wallpainter.lastCrawl';

async function initialize({ util, config }) {
  const { handler } = await initializeWP(`${__dirname}/../data`);
  const logger = util.getLogger('wallpainter');
  let lastCrawl = config.get(CONFIG_LAST_CRAWL) || 0;
  lastCrawl = 0;
  while (true) {
    logger.info('[lastCrawl] %s', lastCrawl);
    if (lastCrawl) {
      const wait = lastCrawl + GAP - Date.now();
      if (wait) {
        logger.info('[sleep] %ds', wait / 1000);
        await util.delay(wait);
      }
    }
    logger.info('[crawl] start');
    await handler.crawl();
    logger.info('[crawl] finish');
    config.set(CONFIG_LAST_CRAWL, lastCrawl = Date.now());
  }
}

module.exports = initialize;
