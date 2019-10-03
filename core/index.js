const fs = require('fs').promises;
const initializeDatabase = require('./db');
const Handler = require('./handler');

async function initialize(dataDir = process.cwd()) {
  const db = await initializeDatabase(`${dataDir}/db.json`);
  await fs.mkdir(`${dataDir}/original`, { recursive: true });
  await fs.mkdir(`${dataDir}/thumbnail`, { recursive: true });
  await fs.mkdir(`${dataDir}/selected`, { recursive: true });

  const mapping = Object.assign({}, ...await Promise.all(
    db.get('images')
    .map((item) => (
      require('fs').promises
      .access(`${dataDir}/original/${item.key}.jpg`)
      .then(() => true, () => false)
      .then(value => ({ [item.key]: value }))
    ))
    .value(),
  ));
  const images = db.get('images').filter(({ key }) => mapping[key]).value();
  db.set('images', images).write();

  return {
    handler: new Handler({ db, dataDir }),
  };
}

module.exports = initialize;
