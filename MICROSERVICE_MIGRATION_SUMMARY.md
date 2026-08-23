# Pharmacy Project Microservice Migration Summary

## Current State
- **Frontend**: Vue.js (vite-project)
- **Backend**: Node.js/Express monolith (pharmacy-backend)
- **Database**: PostgreSQL (pharmacy_db)
- **Status**: Fully functional monolith with clear API endpoints

## Migration Plan (3 Phases)

### Phase 1: Improve Modularity (Stepping Stone)
✅ **Completed**: 
- Separated routes into individual files (`routes/medicines.js`, `routes/inventory.js`, etc.)
- Created service layer for business logic (`services/medicineService.js`, etc.)
- Updated `server.js` to wire routers together
- Benefit: Easier to extract services later while maintaining single deployable unit

### Phase 2: Extract First Microservice
📁 **Created**: `pharmacy-category-service/` with:
- `Dockerfile` for containerization
- Adapted routes, services, and config from monolith
- Configured to run on port 5001
- Can proxy through monolith during transition

### Phase 3: Infrastructure & Expansion
📄 **Created**:
- `docker-compose.yml` for multi-service orchestration
- `nginx.conf` for API gateway routing
- Frontend Dockerfile (`Dockerfile.frontend`)
- Health checks and depends_on configurations

## Files Created for Microservice Migration:

1. `pharmacy-category-service/Dockerfile` - Containerize category service
2. `docker-compose.yml` - Orchestrate PostgreSQL, backend, category service, frontend, gateway
3. `vue-project/pharmacy-backend/Dockerfile` - Containerize monolith backend
4. `vue-project/Dockerfile.frontend` - Containerize Vue.js frontend
5. `nginx.conf` - API gateway routing (/api/categories → category service, /api/* → monolith)
6. `MICROSERVICE_MIGRATION_SUMMARY.md` - This document

## How to Run:

```bash
# Start all services (PostgreSQL, schema init, backend, category service, frontend, gateway)
docker compose up -d --build

# Access points:
# Frontend: http://localhost:5173
# API Gateway: http://localhost:8080  (SPA + /api/*)
# Direct Backend: http://localhost:5000/api/*
# Direct Category Service: http://localhost:5001/api/categories
# Category health: http://localhost:5001/health

# Stop and clean up:
docker compose down        # keep data
docker compose down -v     # also drop the postgres volume
```

See [DOCKER.md](./DOCKER.md) for the full container guide and troubleshooting.

## Docker Setup Fixes (applied)

The original compose stack could not actually run. The following was corrected:

| Problem | Fix |
| --- | --- |
| Services read `DB_HOST=localhost` from `.env`, which points at the container itself | Compose now injects `DB_HOST=postgres`; `.env` files are excluded from the images via `.dockerignore` |
| Empty database — no tables created | Added one-shot `db-init` service running `init-db.js`, gated with `service_completed_successfully` |
| Health checks used `curl`, absent from `node:*-alpine` | Switched to busybox `wget` |
| Frontend image served NGINX on port 80 but compose published `5173:5173` | Published `5173:80` |
| Frontend served static files with no API route — `/api/*` calls 404'd | Added `vue-project/nginx.frontend.conf` proxying `/api/categories` → category-service and `/api/*` → backend |
| Gateway `proxy_pass http://upstream/` stripped the `/api` prefix, so every route 404'd | Removed trailing slashes so paths pass through unchanged |
| Gateway served an empty `/usr/share/nginx/html` | Gateway now proxies `/` to the frontend container |
| Circular/incorrect `depends_on` (backend waited on category-service) | Dependencies now flow postgres → db-init → services |
| `node:20-alpine` violated the frontend's `engines` (Vite 8 needs Node 22+) | All images use `node:22-alpine` |
| `npm ci --only=production` (deprecated) | `npm ci --omit=dev` |
| No `.dockerignore` — local `node_modules` copied into images | Added `.dockerignore` for all three build contexts |
| No shared network, obsolete `version:` key | Added `pharmacy-net` bridge network, removed `version:` |

## Next Steps:
1. Test the category service extraction
2. Extract additional services (medicine, inventory, prescriptions)
3. Replace proxy pattern with API gateway for production
4. Consider database-per-service or schema separation
5. Add observability (logging, monitoring, tracing)

## Current Readiness: 
- Monolith: ✅ Working perfectly
- Modularity: ✅ Improved (ready for extraction)
- First Microservice: 📁 Created (category service)
- Infrastructure: 📄 Configured (docker-compose, nginx)
- Migration Path: 🟡 Clear and actionable