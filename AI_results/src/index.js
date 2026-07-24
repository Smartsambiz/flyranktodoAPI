require('dotenv').config();
const express = require('express');
const db = require('./db');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(express.json());
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Todo API', version: '1.0.0' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT || 3000);

const start = async () => {
  try {
    await db.init();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start app', error);
    process.exit(1);
  }
};

start();
