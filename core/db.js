const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

async function initialize(filename) {
  const adapter = new FileAsync(filename);
  const db = await low(adapter);

  db.defaults({
    images: [],
  }).write();

  db.get('images')
  .map((item) => {
    item.status = item.status || 1;
  })
  .write();

  return db;
}

module.exports = initialize;
