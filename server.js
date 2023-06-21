const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const pool = require('./database.js');

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.json()); // Add this to parse JSON request body

app.get('/bars', (req, res) => {
  const sql = 'SELECT * FROM bars';
  pool.query(sql)
    .then((result) => {
      res.json({
        message: 'success',
        data: result.rows,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message: 'error',
        error: err.message,
      });
    });
});

app.post('/bars', (req, res) => {
  const { name, description, latitude, longitude } = req.body;
  const sql = 'INSERT INTO bars (name, description, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id';
  const values = [name, description, latitude, longitude];

  pool.query(sql, values)
    .then((result) => {
      const barId = result.rows[0].id;
      res.json({
        message: 'success',
        data: {
          id: barId,
          name,
          latitude,
          longitude,
        },
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message: 'error',
        error: err.message,
      });
    });
});

// ...

app.get('/bars/:id/tags', (req, res) => {
  const sql = 'SELECT * FROM tags WHERE bar_id = $1';
  const values = [req.params.id];

  pool.query(sql, values)
    .then((result) => {
      res.json({
        message: 'success',
        data: result.rows,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message: 'error',
        error: err.message,
      });
    });
});

app.post('/bars/:id/tags', (req, res) => {
  const { name } = req.body;
  const sql = 'INSERT INTO tags (name, bar_id) VALUES ($1, $2) RETURNING id';
  const values = [name, req.params.id];

  pool.query(sql, values)
    .then((result) => {
      const tagId = result.rows[0].id;
      res.json({
        message: 'success',
        data: {
          id: tagId,
          name,
          bar_id: req.params.id,
          upvotes: 0,
          downvotes: 0,
        },
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message: 'error',
        error: err.message,
      });
    });
});

app.post('/tags/:id/vote', (req, res) => {
  const { vote } = req.body;
  const sql = vote > 0
    ? 'UPDATE tags SET upvotes = upvotes + 1 WHERE id = $1'
    : 'UPDATE tags SET downvotes = downvotes + 1 WHERE id = $1';
  const values = [req.params.id];

  pool.query(sql, values)
    .then(() => {
      res.json({
        message: 'success',
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message: 'error',
        error: err.message,
      });
    });
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
