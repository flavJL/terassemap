const sqlite3 = require('sqlite3').verbose();

// Open a database handle
let db = new sqlite3.Database('./terassemap.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the terassemap database.');
});

// Create table for bars
db.run(`CREATE TABLE IF NOT EXISTS bars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
)`, (err) => {
    if (err) {
        console.error(err.message);
    }
});

// Create table for tags
db.run(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    bar_id INTEGER,
    FOREIGN KEY (bar_id) REFERENCES bars(id)
)`, (err) => {
    if (err) {
        console.error(err.message);
    }
});

module.exports = db;
