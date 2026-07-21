const express = require('express');
const swaggerUi = require('swagger-ui-express');
const app = express();
const openApiDocumentation = require('./openapi.json');
const db = require('./db');
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));

const PORT = process.env.PORT || 3000;

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
    const tasks = db.prepare('SELECT * FROM tasks').all();
    res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(req.params.id));
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

    const info = db.prepare('INSERT INTO tasks (title, done) VALUES (?, 0)').run(title);
    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(Number(info.lastInsertRowid));

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

    const info = db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(title, done ? 1 : 0, id);
    if (info.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(task);
})

app.delete('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id);
    const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    if (info.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
    }
    res.status(204).send();
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
