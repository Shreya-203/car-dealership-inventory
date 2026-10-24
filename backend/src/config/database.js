const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDirectory = path.join(__dirname, "../../data");

if (!fs.existsSync(dataDirectory)) {
fs.mkdirSync(dataDirectory, { recursive: true });
}

const db = new Database(
path.join(dataDirectory, "dealership.db")
);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT NOT NULL UNIQUE,
password TEXT NOT NULL,
role TEXT NOT NULL DEFAULT 'user'
CHECK (role IN ('user', 'admin')),
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
id INTEGER PRIMARY KEY AUTOINCREMENT,
make TEXT NOT NULL,
model TEXT NOT NULL,
category TEXT NOT NULL,
price REAL NOT NULL CHECK (price >= 0),
quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
image_url TEXT,
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;
