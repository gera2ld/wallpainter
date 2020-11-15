const fs = require('fs');
const path = require('path');
const initializeWP = require('../core');

const GAP = 24 * 60 * 60 * 1000;
const CONFIG_LAST_CRAWL = 'wallpainter.lastCrawl';

async function initialize({
  util, config, electron, registerMenu,
}) {
  const dataDir = `${__dirname}/../data`;
  const { handler } = await initializeWP(dataDir);
  const logger = util.getLogger('wallpainter');

  global.wallPainterHandler = handler;

  const { BrowserWindow } = electron;
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
  };
  const handleShowWindow = () => {
    let win = new BrowserWindow({
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
    });
    // win.webContents.openDevTools();
    win.removeMenu();
    win.webContents.session.protocol.interceptStreamProtocol('https', async (req, callback) => {
      const url = new URL(req.url);
      if (url.host !== 'wallpainter') {
        callback({ statusCode: 404 });
        return;
      }
      let data;
      let contentType;
      const imageFields = url.pathname.match(/^\/images\/([^/]+)\/(original|thumbnail)/);
      if (imageFields) {
        const [, key, size] = imageFields;
        let filename;
        try {
          filename = `${dataDir}/${size}/${key}.jpg`;
          await fs.promises.access(filename);
        } catch (err) {
          if (size === 'thumbnail' && err.code === 'ENOENT') {
            await handler.createThumbnail(key);
            filename = `${dataDir}/${size}/${key}.jpg`;
            await fs.promises.access(filename);
          } else {
            throw err;
          }
        }
        data = fs.createReadStream(filename);
        contentType = 'image/jpeg';
      } else {
        const filename = `${__dirname}/../app/dist${url.pathname}`;
        data = fs.createReadStream(filename);
        contentType = contentTypes[path.extname(url.pathname)] || 'text/plain';
      }
      callback({
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'max-age=31536000',
        },
        data,
      });
    });
    win.loadURL('https://wallpainter/index.html');
    win.on('closed', () => {
      win = null;
      handler.shrinkPool();
    });
  };
  registerMenu({
    label: 'Wall Painter',
    click: handleShowWindow,
  });

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
