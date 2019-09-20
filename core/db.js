const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

async function initialize() {
  const adapter = new FileAsync('data/db.json');
  const db = await low(adapter);

  db.defaults({
    images: [],
  }).write();

  return db;
}

module.exports = initialize;
