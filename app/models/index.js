const db = require("../../db/db.js");

async function synchronizeModels() {
  try {
    await db.createTableUser();
    await db.createTableTransaction();
    await db.createTableServices();
    await db.createTableBanner();
    console.log('Database & tables created!');
  } catch (err) {
    console.error('Error creating database & tables: ', err);
  }
}

module.exports = {
    synchronizeModels
}