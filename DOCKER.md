# Running the Pharmacy stack with Docker

Everything is orchestrated by `docker-compose.yml` at the repository root.
You only need **Docker Desktop** (or Docker Engine + Compose v2) installed — no
local Node.js or PostgreSQL required.

## Quick start

```bash
# from the repository root
docker compose up -d --build

# follow the logs
docker compose logs -f

# stop (keep data)
docker compose down

# stop and wipe the database volume
docker compose down -v
```

## Access points

| What | URL |
| --- | --- |
| Frontend (Vue SPA, API proxied) | http://localhost:5173 |
| API Gateway (SPA + routed APIs) | http://localhost:8080 |
| Monolith backend (direct) | http://localhost:5000/api/... |
| Category microservice (direct) | http://localhost:5001/api/categories |
| Category service health | http://localhost:5001/health |
| PostgreSQL | localhost:5432 (user `postgres`, db `pharmacy_db`) |

## What starts, and in what order

1. **postgres** – PostgreSQL 15, data kept in the `postgres_data` volume.
   Compose waits for `pg_isready` before continuing.
2. **db-init** – one-shot job that runs `init-db.js` (creates the database,
   tables and seed rows). It must exit successfully before the services start.
3. **category-service** – the extracted microservice on port 5001.
4. **pharmacy-backend** – the monolith on port 5000.
5. **frontend** – the Vue app built with Vite and served by NGINX on port 80
   (published as 5173). It proxies `/api/categories` to the category service
   and every other `/api/*` call to the monolith, so the browser only ever
   talks to one origin — no CORS issues and no hard-coded `localhost` URLs.
6. **api-gateway** – optional production-style NGINX gateway on port 8080 that
   fronts both the SPA and the APIs.

## Configuration

Database credentials come from the compose file and can be overridden by a
`.env` file at the repository root (see `.env.example`):

```env
DB_USER=postgres
DB_PASSWORD=123123
DB_NAME=pharmacy_db
DB_PORT_HOST=5432
```

Inside containers `DB_HOST` is **`postgres`** (the service name), not
`localhost`. Compose injects these values as real environment variables, and
`dotenv` never overwrites variables that already exist, so the per-service
`.env` files (which target host development) keep working outside Docker.

## Running without Docker (host mode)

```bash
# database must be reachable at localhost:5432
cd vue-project/pharmacy-backend && npm install && npm run init-db && npm run dev
cd ../../pharmacy-category-service && npm install && npm run dev
cd ../vue-project && npm install && npm run dev   # Vite proxies /api to :5000
```

## Troubleshooting

* `docker compose ps` – check container state and health.
* `docker compose logs db-init` – schema creation problems.
* `docker compose exec postgres psql -U postgres -d pharmacy_db -c '\dt'` –
  list tables.
* Port already in use → change the host side of the port mapping in
  `docker-compose.yml` (e.g. `"5433:5432"`), or set `DB_PORT_HOST` in `.env`.
* Rebuild a single service after code changes:
  `docker compose up -d --build pharmacy-backend`.
