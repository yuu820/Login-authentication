const Database = require("better-sqlite3");
const path = require("path");

const dbpath = path.resolve(__dirname, "auth.db");
const db = new Database(dbpath);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  role TEXT NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// ADMIN USER CREATION
const admincheck=db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!admincheck) {
  const adminuuid=crypto.randomUUID();
  const adminpasswordhash=bcrypt.hashSync(process.env.ADMIN_PASSWORD , 10);
  db.prepare("INSERT INTO users (uuid, username, password_hash, status, role) VALUES (?, ?, ?, 'active', 'admin')").run(adminuuid, "admin", adminpasswordhash);
  console.log("Admin user created with username: admin and password: " + process.env.ADMIN_PASSWORD);
}
module.exports = db;