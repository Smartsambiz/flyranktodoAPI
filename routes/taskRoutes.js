const express = require('express');
const router = express.Router();
const { getAllTasks, getTaskById, getStats, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.get('/', (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoint: "/tasks"
    });
});

router.get('/health', (req, res) => {
    res.json({
        status: "OK",
    });
});

router.get('/tasks', getAllTasks);
router.get('/tasks/:id', getTaskById);
router.get('/stats', getStats);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

module.exports = router;
