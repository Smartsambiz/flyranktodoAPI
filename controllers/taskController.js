const db = require('../db');

// GET /tasks (Supports search, filter by done status, and sorting)
const getAllTasks = async (req, res) => {
    try {
        let sql = 'SELECT * FROM tasks WHERE 1=1';
        const params = [];

        if (req.query.search) {
            params.push(`%${req.query.search}%`);
            sql += ` AND title ILIKE $${params.length}`; // ILIKE is case-insensitive in Postgres
        }

        if (req.query.done !== undefined) {
            params.push(req.query.done === 'true');
            sql += ` AND done = $${params.length}`;
        }

        if (req.query.sort === 'title') {
            sql += ' ORDER BY title ASC';
        } else {
            sql += ' ORDER BY id ASC';
        }

        const { rows } = await db.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('Error in getAllTasks:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /tasks/:id
const getTaskById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (err) {
        console.error('Error in getTaskById:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /tasks/stats
const getStats = async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT
              COUNT(*)::int as total,
              COUNT(*) FILTER (WHERE done = true)::int as completed,
              COUNT(*) FILTER (WHERE done = false)::int as pending
            FROM tasks
        `);
        res.json(rows[0]);
    } catch (err) {
        console.error('Error in getStats:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// POST /tasks
const createTask = async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        // RETURNING * returns the newly created row immediately (no 2nd query needed!)
        const { rows } = await db.query(
            `INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *`,
            [title, false]
        );

        return res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error in createTask:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// PUT /tasks/:id
const updateTask = async (req, res) => {
    const id = Number(req.params.id);
    const { title, done } = req.body;

    if (!title || typeof done !== 'boolean') {
        return res.status(400).json({ error: 'Title and done are required' });
    }

    try {
        // RETURNING * gives us the updated row, or empty rows array if ID didn't exist
        const { rows } = await db.query(
            `UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *`,
            [title, done, id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error in updateTask:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// DELETE /tasks/:id
const deleteTask = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { rowCount } = await db.query('DELETE FROM tasks WHERE id = $1', [id]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(204).send();
    } catch (err) {
        console.error('Error in deleteTask:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    getStats,
    createTask,
    updateTask,
    deleteTask,
};