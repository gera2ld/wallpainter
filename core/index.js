const fs = require('fs').promises;
const carlo = require('carlo');
const { rpc } = require('carlo/rpc');
const Jimp = require('jimp');
const initializeDatabase = require('./db');
const Handler = require('./handler');

async function main() {
  const db = await initializeDatabase();
  await fs.mkdir('data/original', { recursive: true });
  await fs.mkdir('data/thumbnail', { recursive: true });
  const app = await carlo.launch();
  app.on('exit', () => process.exit());
  app.serveHandler(async request => {
    const url = new URL(request.url());
    const imageFields = url.pathname.match(/^\/images\/([^/]+)\/(\w+)/);
    if (imageFields) {
      const [, key, size] = imageFields;
      let body;
      try {
        body = await fs.readFile(`data/${size}/${key}.jpg`);
      } catch (err) {
        if (size === 'thumbnail' && err.code === 'ENOENT') {
          const img = await Jimp.read(`data/original/${key}.jpg`);
          await img.scaleToFit(270, 270);
          await img.writeAsync(`data/thumbnail/${key}.jpg`);
          body = await fs.readFile(`data/${size}/${key}.jpg`);
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
  });
  app.serveFolder('app/dist');
  await app.load(`index.html`, rpc.handle(new Handler(db)));
  // await app.load('http://localhost:3000/', rpc.handle(new Handler(db)));
}

main();
