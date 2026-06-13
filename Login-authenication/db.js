const Database = require("better-sqlite3");
const path = require("path");

const dbpath = path.resolve(__dirname, "auth.db");
const db = new Database(dbpath);


db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;