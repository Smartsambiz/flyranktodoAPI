# Task API

A simple CRUD REST API for managing tasks, built with Express and PostgreSQL. Each task has an `id`, a `title`, a `done` status, and timestamps. The API is fully documented with Swagger UI.

---

## Features

- List all tasks (with search, filter, and sort)
- Get a single task by ID
- Create a new task
- Update an existing task (title and completion status)
- Delete a task
- Statistics endpoint
- Health check endpoint
- Interactive API documentation via Swagger UI
- Persistent PostgreSQL storage via `DATABASE_URL`

---

## Technologies Used

- **Node.js** — JavaScript runtime
- **Express 5** — Web framework
- **PostgreSQL** — Relational database
- **pg** — PostgreSQL client for Node
- **Swagger UI Express** — Interactive API docs

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A running PostgreSQL database and a valid `DATABASE_URL`

### One command to start

```bash
git clone <repository-url>
cd flyrank-todo-api
npm install
DATABASE_URL="postgres://user:password@host:5432/dbname" npm start
```

The API will be available at **http://localhost:3000**. The PostgreSQL database is initialized automatically on first run with sample tasks if the `tasks` table is empty.

> Use `npm run dev` during development for auto-restart via nodemon.

---

## API Endpoints

| Method   | Endpoint                 | Description                    |
|----------|--------------------------|--------------------------------|
| `GET`    | `/`                      | API information                |
| `GET`    | `/health`                | Health check                   |
| `GET`    | `/tasks`                 | List all tasks                 |
| `GET`    | `/tasks?search=keyword`  | Search tasks by title          |
| `GET`    | `/tasks?done=true`       | Filter by completion status    |
| `GET`    | `/tasks?sort=title`      | Sort tasks alphabetically      |
| `GET`    | `/tasks/:id`             | Get a task by ID               |
| `GET`    | `/stats`                 | Get task statistics            |
| `POST`   | `/tasks`                 | Create a new task              |
| `PUT`    | `/tasks/:id`             | Update a task                  |
| `DELETE` | `/tasks/:id`             | Delete a task                  |

Query parameters on `GET /tasks` can be combined (e.g. `/tasks?search=milk&done=false&sort=title`).

### Example Requests & Responses

#### List all tasks

```bash
curl http://localhost:3000/tasks
```

```json
[
  { "id": 1, "title": "Learn Express", "done": true, "created_at": "2026-07-21 12:00:00", "updated_at": "2026-07-21 12:00:00" },
  { "id": 2, "title": "Build Task API", "done": false, "created_at": "2026-07-21 12:00:00", "updated_at": "2026-07-21 12:00:00" },
  { "id": 3, "title": "Deploy",         "done": false, "created_at": "2026-07-21 12:00:00", "updated_at": "2026-07-21 12:00:00" }
]
```

#### Search, filter, and sort

```bash
curl "http://localhost:3000/tasks?search=Build&sort=title"
```

#### Statistics

```bash
curl http://localhost:3000/stats
```

```json
{ "total": 3, "completed": 1, "pending": 2 }
```

---

## Swagger Documentation

Interactive API documentation is available at:

**http://localhost:3000/docs**

![Swagger UI Screenshot](./Swagger%20UI.png)

---

## Project Structure

```
flyrank-todo-api/
├── controllers/
│   └── taskController.js   # Task CRUD logic and database queries
├── routes/
│   └── taskRoutes.js       # Express router — all route definitions
├── db.js                   # PostgreSQL setup, seeding, and query wrapper
├── index.js                # Express app entry point (middleware + server)
├── openapi.json            # OpenAPI 3.0 specification
├── package.json
├── package-lock.json
└── README.md
```

### How requests flow

1. **`index.js`** sets up the Express app, registers middleware (`express.json()` for request body parsing, Swagger UI at `/docs`), and mounts the router from `routes/taskRoutes.js`.
2. **`routes/taskRoutes.js`** maps HTTP methods + paths to controller functions. It also handles the root (`/`) and `/health` endpoints.
3. **`controllers/taskController.js`** contains the business logic — it queries `db.js` and sends JSON responses.
4. **`db.js`** initializes the SQLite database, creates the `tasks` table if it doesn't exist, seeds initial data, and wraps `prepare()` to auto-convert booleans to integers (and back) for the `done` column.

---

## A Note on Database Migrations

Adding the `created_at` and `updated_at` columns after the app was already running meant writing migration code to detect the old schema and alter the table. This felt fragile — if another developer had a slightly different version of the database, the migration could fail silently. This is exactly why dedicated migration tools exist: they track which changes have been applied and run them in order, so you never have to guess what shape the database is in.
![DB browswer for sqlite screenshot](./DBBrowser.png)

---

## Future Improvements

- Add pagination to `GET /tasks`
- Add user authentication and authorization
- Add request validation middleware (e.g. Joi or Zod)
- Write automated tests
- Add CORS support
- Containerize with Docker
