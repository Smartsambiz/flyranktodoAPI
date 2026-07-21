const express = require('express');
const swaggerUi = require('swagger-ui-express');
const app = express();
const openApiDocumentation = require('./openapi.json');
const db = require('./db');
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));

const PORT = process.env.PORT || 3000;

const stmtGetTaskById = db.prepare('SELECT * FROM tasks WHERE id = ?');
const stmtInsertTask = db.prepare(`INSERT INTO tasks (title, done, created_at, updated_at) VALUES (?, 0, datetime('now'), datetime('now'))`);
const stmtUpdateTask = db.prepare(`UPDATE tasks SET title = ?, done = ?, updated_at = datetime('now') WHERE id = ?`);
const stmtDeleteTask = db.prepare('DELETE FROM tasks WHERE id = ?');
const stmtStats = db.prepare(`SELECT
  COUNT(*) as total,
  SUM(CASE WHEN done = 1 THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN done = 0 THEN 1 ELSE 0 END) as pending
FROM tasks`);

app.get('/', (req, res) => {
    res.json({ 
        name: "Task API",
        version: "1.0",
        endpoint: "/tasks"
    });
});

app.get('/health', (req, res)=>{
    res.json({
        status: "OK",
    })
})

app.get('/tasks', (req, res) => {
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (req.query.search) {
        sql += ' AND title LIKE ?';
        params.push(`%${req.query.search}%`);
    }

    if (req.query.done !== undefined) {
        sql += ' AND done = ?';
        params.push(req.query.done === 'true' ? 1 : 0);
    }

    if (req.query.sort === 'title') {
        sql += ' ORDER BY title';
    }

    const tasks = db.prepare(sql).all(...params);
    res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
    const task = stmtGetTaskById.get(Number(req.params.id));
    if (task) {
        res.json(task);
    } else {
        res.status(404).json({ error: "Task not found" });
    }
});

app.get('/stats', (req, res) => {
    res.json(stmtStats.get());
});

app.post('/tasks', (req, res)=>{
    const { title } = req.body;
    if(!title){
        return res.status(400).json({
            error: "Title is required"
        })
    };

    const info = stmtInsertTask.run(title);
    const newTask = stmtGetTaskById.get(Number(info.lastInsertRowid));

    return res.status(201).json(newTask)
})

app.put('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id);
    const { title, done } = req.body;
    if(!title || typeof done !== "boolean"){
        return res.status(400).json({
            error: "Title and done are required"
        })
    }

    const info = stmtUpdateTask.run(title, done, id);
    if (info.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
    }

    const task = stmtGetTaskById.get(id);
    res.json(task);
})

app.delete('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id);
    const info = stmtDeleteTask.run(id);
    if (info.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
    }
    res.status(204).send();
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
