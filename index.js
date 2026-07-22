const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openApiDocumentation = require('./openapi.json');
const routes = require('./routes/taskRoutes');
const { initDb } = require('./db');

const app = express();

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));
app.use('/', routes);

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await initDb();
    console.log('Database initialized successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();