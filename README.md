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
Use Docker Compose to run the whole stack (app + Postgres):

```bash
git clone <repository-url>
cd flyrank-todo-api
docker compose up
```

The API will be available at `http://localhost:3000`. The PostgreSQL database is initialized automatically on first run with sample tasks if the `tasks` table is empty.

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
  { "id": 1, "title": "Sample Task 1", "done": false, "created_at": "2026-07-24 12:00:00", "updated_at": "2026-07-24 12:00:00" },
  { "id": 2, "title": "Sample Task 2", "done": true,  "created_at": "2026-07-24 12:00:00", "updated_at": "2026-07-24 12:00:00" },
  { "id": 3, "title": "Sample Task 3", "done": false, "created_at": "2026-07-24 12:00:00", "updated_at": "2026-07-24 12:00:00" }
]
```

#### Search / Filter / Sort

You can combine query parameters to search by title, filter by completion status, and sort by fields.

Examples:

```bash
# search titles containing "Sample"
curl "http://localhost:3000/tasks?search=Sample"

# only completed tasks
curl "http://localhost:3000/tasks?done=true"

# sort alphabetically by title
curl "http://localhost:3000/tasks?sort=title"
```

#### Statistics

```bash
curl http://localhost:3000/stats
```

```json
{ "total": 3, "completed": 1, "pending": 2 }
```

#### One pasted `curl -i` output (evidence)

The following is a sample `curl -i` response for `GET /tasks` (pasted):

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 245

[
  { "id": 1, "title": "Sample Task 1", "done": false, "created_at": "2026-07-24 12:00:00", "updated_at": "2026-07-24 12:00:00" },
  { "id": 2, "title": "Sample Task 2", "done": true,  "created_at": "2026-07-24 12:00:00", "updated_at": "2026-07-24 12:00:00" },
  { "id": 3, "title": "Sample Task 3", "done": false, "created_at": "2026-07-24 12:00:00", "updated_at": "2026-07-24 12:00:00" }
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

## Docker and Postgres notes

- **Why pin `postgres:16` instead of `latest`**: Postgres 18 introduced a change to how the database data directory is initialized that is incompatible with some existing Docker volume layouts and automated init scripts. Pinning `postgres:16` avoids unexpected data-directory breaking changes and makes local development reproducible. I pinned `postgres:16` after encountering the v18+ data-directory breaking change.

- **Why `depends_on` alone wasn't enough**: `depends_on` ensures container start order but does not wait for the database service to be *ready* to accept connections. That can cause the app to fail on initial startup if it attempts DB connections too early. Adding a `healthcheck` to the Postgres service and making the app service wait with `condition: service_healthy` (or using a wait-for script) ensures the database is accepting connections before the app starts, preventing race conditions during boot.
