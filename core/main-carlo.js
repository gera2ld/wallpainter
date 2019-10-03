const fs = require('fs').promises;
const carlo = require('carlo');
const { rpc } = require('carlo/rpc');
const Pool = require('@gera2ld/process-pool');
const initialize = require('.');
const { wrapError } = require('./util');

const pool = new Pool(3, `${__dirname}/worker.js`);

async function main() {
  const { handler } = await initialize('data');
  const app = await carlo.launch();
  app.on('exit', () => process.exit());
  app.serveHandler(wrapError(async request => {
    const url = new URL(request.url());
    const imageFields = url.pathname.match(/^\/images\/([^/]+)\/(original|thumbnail)/);
    if (imageFields) {
      const [, key, size] = imageFields;
      let body;
      try {
        body = await fs.readFile(`data/${size}/${key}.jpg`);
      } catch (err) {
        if (size === 'thumbnail' && err.code === 'ENOENT') {
          await pool.invoke('getThumbnail', key);
          body = await fs.readFile(`data/${size}/${key}.jpg`);
        } else {
          throw err;
        }
      }
      if (body) {
        request.fulfill({
          headers: {
            'Cache-Control': 'max-age=31536000',
          },
          body,
        });
      } else {
        request.fail();
      }
    } else {
      request.continue();
    }
  }));
  app.serveFolder('app/dist');
  await app.load(`index.html`, rpc.handle(handler));
}

main();
