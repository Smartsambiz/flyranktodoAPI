# Dockerized Todo API

A fresh CRUD todo API built with Express and PostgreSQL 16, designed to run inside Docker Compose.

## What I created

- `Dockerfile` for a lightweight Node.js app image
- `docker-compose.yml` with a Postgres 16 database and healthcheck
- `.env.example` with the required environment variables
- `package.json` with dependencies: `express`, `pg`, `dotenv`
- `src/index.js` to start the Express app and initialize the database
- `src/db.js` to connect to Postgres and create the `tasks` table if missing
- `src/routes/tasks.js` with full CRUD endpoints plus:
  - `GET /tasks` to list all todos
  - `GET /tasks/done` to list completed todos
  - `GET /tasks/pending` to list pending todos
  - `GET /tasks/:id` to get one todo
  - `POST /tasks` to create
  - `PUT /tasks/:id` to update
  - `DELETE /tasks/:id` to remove

## Environment variables

The app reads from `.env` (copy from `.env.example`):

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`

`DATABASE_URL` is set for Docker Compose to connect to the Postgres container:

`postgres://todo_user:todo_pass@db:5432/todo_db`

## Run everything

```bash
cd AI_results
docker compose up --build
```

The API will be available at `http://localhost:3000`.

## Notes

- Postgres is pinned to `postgres:16` as requested.
- `docker-compose.yml` uses a `healthcheck` for the database and `depends_on.condition: service_healthy` so the app waits until Postgres is ready.
- The app initializes the `tasks` table automatically on startup.

## Example requests

```bash
curl http://localhost:3000/tasks
curl http://localhost:3000/tasks/done
curl http://localhost:3000/tasks/pending
curl -X POST http://localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"New task"}'
```
