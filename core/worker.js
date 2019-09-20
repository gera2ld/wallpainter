const Jimp = require('jimp');
const worker = require('@gera2ld/process-pool/lib/worker');

class Handler {
  async getThumbnail(key) {
    const img = await Jimp.read(`data/original/${key}.jpg`);
    await img.scaleToFit(270, 270);
    await img.writeAsync(`data/thumbnail/${key}.jpg`);
  }
}

worker.setHandler(new Handler());
