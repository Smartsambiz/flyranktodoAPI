# Task API

A simple CRUD REST API for managing tasks, built with Express. Each task has an `id`, a `title`, and a `done` status. The API is fully documented with Swagger UI.

---

## Features

- List all tasks
- Get a single task by ID
- Create a new task
- Update an existing task (title and completion status)
- Delete a task
- Health check endpoint
- Interactive API documentation via Swagger UI

---

## Technologies Used

- **Node.js** — JavaScript runtime
- **Express 5** — Web framework
- **Swagger UI Express** — Interactive API docs

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (ships with Node.js)

### Steps

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd flyrank-todo-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   npm start
   ```

   > Alternatively, use `npx nodemon index.js` during development for auto-restart.

The API will be available at **http://localhost:3000**.

---

## API Endpoints

| Method   | Endpoint          | Description              |
|----------|-------------------|--------------------------|
| `GET`    | `/`               | API information          |
| `GET`    | `/health`         | Health check             |
| `GET`    | `/tasks`          | List all tasks           |
| `GET`    | `/tasks/:id`      | Get a task by ID         |
| `POST`   | `/tasks`          | Create a new task        |
| `PUT`    | `/tasks/:id`      | Update a task            |
| `DELETE` | `/tasks/:id`      | Delete a task            |

### Example Requests & Responses

#### List all tasks

```bash
curl http://localhost:3000/tasks
```

```json
[
  { "id": 1, "title": "Learn Express", "done": true },
  { "id": 2, "title": "Build Task API", "done": false },
  { "id": 3, "title": "Deploy",         "done": false }
]
```

#### Get a task by ID

```bash
curl http://localhost:3000/tasks/1
```

```json
{ "id": 1, "title": "Learn Express", "done": true }
```

#### Create a task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries"}'
```

```json
{ "id": 4, "title": "Buy groceries", "done": false }
```

#### Update a task

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Express in depth", "done": true}'
```

```json
{ "id": 1, "title": "Learn Express in depth", "done": true }
```

#### Delete a task

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

Returns `204 No Content`.

---

## Swagger Documentation

Interactive API documentation is available at:

**http://localhost:3000/docs**

![Swagger UI Screenshot](./Swagger%20UI.png)

---

## Project Structure

```
flyrank-todo-api/
├── node_modules/
├── index.js          # Express server and route definitions
├── openapi.json      # OpenAPI 3.0 specification
├── package.json
├── package-lock.json
└── README.md
```

---

## Future Improvements

- Persist tasks in a database (e.g. SQLite, PostgreSQL)
- Add filtering, sorting, and pagination to `GET /tasks`
- Add user authentication and authorization
- Add request validation middleware (e.g. Joi or Zod)
- Write automated tests
- Add CORS support
- Containerize with Docker
