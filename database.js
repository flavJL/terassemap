const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: '5432',
  user: 'postgres',
  password: 'postgres',
  database: 'barmapdb',
});

// Create table for bars
pool.query(`CREATE TABLE IF NOT EXISTS bars (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL
)`).catch(err => console.error(err));

// Create table for tags
pool.query(`CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    bar_id INTEGER,
    FOREIGN KEY (bar_id) REFERENCES bars(id)
)`).catch(err => console.error(err));

module.exports = pool;
