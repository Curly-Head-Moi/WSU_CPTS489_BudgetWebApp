// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbName = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbName, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database:', dbName);
  }
});

// Create the "signatures" table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS signatures (

    )
  `);
});

module.exports = db;
