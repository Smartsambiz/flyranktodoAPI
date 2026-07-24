const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (req.query.done === 'true' || req.query.done === 'false') {
      params.push(req.query.done === 'true');
      sql += ` AND done = $${params.length}`;
    }

    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      sql += ` AND title ILIKE $${params.length}`;
    }

    if (req.query.sort === 'title') {
      sql += ' ORDER BY title ASC';
    } else {
      sql += ' ORDER BY id ASC';
    }

    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/done', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM tasks WHERE done = true ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/pending', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM tasks WHERE done = false ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, done = false } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { rows } = await db.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
      [title, done]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, done } = req.body;
    if (!title || typeof title !== 'string' || typeof done !== 'boolean') {
      return res.status(400).json({ error: 'Title and done are required' });
    }

    const { rows } = await db.query(
      'UPDATE tasks SET title = $1, done = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [title, done, id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const result = await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
