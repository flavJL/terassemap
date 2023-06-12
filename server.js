const express = require('express');
const path = require('path');
const app = express();
const port = 3009;  
const db = require('./database.js');

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '.')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.json()); // Add this to parse JSON request body

app.get('/bars', (req, res) => {
    const sql = 'SELECT * FROM bars';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/bars', express.json(), (req, res) => {
    const { name, description, latitude, longitude } = req.body;
    const sql = 'INSERT INTO bars (name, description, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.run(sql, [name, description, latitude, longitude], function (err) {
        if (err) {
            return console.error(err.message);
        }
        res.json({
            "message": "success",
            "data": {
                id: this.lastID,
                name: name,
                latitude: latitude,
                longitude: longitude
            }
        });
    });
});


// ...

app.get('/bars/:id/tags', (req, res) => {
    const sql = 'SELECT * FROM tags WHERE bar_id = ?';
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/bars/:id/tags', express.json(), (req, res) => {
    const { name } = req.body;
    const sql = 'INSERT INTO tags (name, bar_id) VALUES (?, ?)';
    db.run(sql, [name, req.params.id], function (err) {
        if (err) {
            return console.error(err.message);
        }
        res.json({
            "message": "success",
            "data": {
                id: this.lastID,
                name: name,
                bar_id: req.params.id,
                upvotes: 0,
                downvotes: 0
            }
        });
    });
});

app.post('/tags/:id/vote', express.json(), (req, res) => {
    const { vote } = req.body;
    const sql = vote > 0 ? 'UPDATE tags SET upvotes = upvotes + 1 WHERE id = ?' : 'UPDATE tags SET downvotes = downvotes + 1 WHERE id = ?';
    db.run(sql, [req.params.id], function (err) {
        if (err) {
            return console.error(err.message);
        }
        res.json({ "message": "success" });
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

