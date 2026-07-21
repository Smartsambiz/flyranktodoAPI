const express = require('express');
const swaggerUi = require('swagger-ui-express');
const app = express();
const openApiDocumentation = require('./openapi.json');
const db = require('./db');
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));

const PORT = process.env.PORT || 3000;

const stmtAllTasks = db.prepare('SELECT * FROM tasks');
const stmtGetTaskById = db.prepare('SELECT * FROM tasks WHERE id = ?');
const stmtInsertTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, 0)');
const stmtUpdateTask = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?');
const stmtDeleteTask = db.prepare('DELETE FROM tasks WHERE id = ?');

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
    const tasks = stmtAllTasks.all();
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
