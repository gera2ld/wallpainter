const Jimp = require('jimp');

class Handler {
  async getThumbnail(key) {
    const img = await Jimp.read(`data/original/${key}.jpg`);
    await img.scaleToFit(270, 270);
    await img.writeAsync(`data/thumbnail/${key}.jpg`);
  }
}

const handler = new Handler();

process.on('message', async ({ id, command, params }) => {
  let result;
  let error;
  try {
    result = await handler[command](...params);
  } catch (err) {
    error = `${err}` || 'Unknown error';
  }
  process.send({ id, result, error });
});
