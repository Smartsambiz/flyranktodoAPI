const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openApiDocumentation = require('./openapi.json');
const routes = require('./routes/taskRoutes');

const app = express();

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));
app.use('/', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
