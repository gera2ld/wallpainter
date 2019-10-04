const Jimp = require('jimp');
const worker = require('@gera2ld/process-pool/lib/worker');

const dataDir = process.env.WALLPAINTER_DATA_DIR || `${__dirname}/../data`;

class Handler {
  async getThumbnail(key) {
    const img = await Jimp.read(`${dataDir}/original/${key}.jpg`);
    await img.scaleToFit(270, 270);
    await img.writeAsync(`${dataDir}/thumbnail/${key}.jpg`);
  }
}

worker.setHandler(new Handler());
