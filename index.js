const express = require('express');
const swaggerUi = require('swagger-ui-express');
const app = express();
const openApiDocumentation = require('./openapi.json');
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));

const PORT = process.env.PORT || 3000;

const tasks = [
    {
        id: 1, 
        title: "Learn Express", 
        done: true,
    },
    {
        id: 2,
        title: "Build Task API",
        done: false,
    
    },
    {
        id: 3,
        title: "Deploy",
        done: false,
    }
]

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
    res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);
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

    const newTask = {
        id: tasks.length + 1,
        title,
        done: false,
    };
    tasks.push(newTask);

    return res.status(201).json(newTask)
})


app.put('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id);
    const { title, done } = req.body;
    const task = tasks.find((task)=> task.id === id);
    if(!task){
        return res.status(404).json({
            error: "Task not found",
        })
    }
    if(!title || typeof done !== "boolean"){
        return res.status(400).json({
            error: "Title and done are required"
        })
    }

    task.title = title;
    task.done = done;
    res.json(task);
})

app.delete('/tasks/:id', (req, res)=>{
    const id = Number(req.params.id);
    const taskIndex = tasks.findIndex((task)=>task.id === id);
    if(taskIndex === -1){
        return res.status(404).json({
            error: "Task not found"
        })
    }
    tasks.splice(taskIndex, 1);
    res.status(204).send();

})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});