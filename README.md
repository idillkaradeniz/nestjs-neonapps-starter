# Neon Academy — NestJS Backend

Neon Academy onboarding starter: a NestJS 11 backend built day-by-day, covering auth, RBAC, Postgres via Drizzle, Redis-backed rate limiting, structured logging/error tracking, and OpenAPI documentation.

## Running locally

```bash
docker compose up -d   # Postgres + Redis
pnpm install
pnpm start:dev
```

The API listens on `http://localhost:3000`. Every route lives under `/api/v1/...` (URI versioning), except `/api/health`, which is version-neutral for load balancers/infra tooling.

## API documentation (Swagger / OpenAPI)

Interactive docs: `http://localhost:3000/api/docs` (protected by HTTP Basic Auth outside `development`, using the `SWAGGER_USER`/`SWAGGER_PASSWORD` env vars).

The underlying OpenAPI 3.0 JSON is published to a stable path in this repo: **`docs/api/openapi.json`**. This is the exact contract downstream consumers (e.g. the frontend's `openapi-typescript` codegen) build against — treat a route or DTO change without a regenerated spec as an incomplete PR.

To regenerate it after changing any controller/DTO:

```bash
pnpm gen:api
```

This boots the Nest app just long enough to build the Swagger document, writes it to `docs/api/openapi.json`, and exits (no HTTP listener, no side effects beyond the file write).

## Postman

A hand-built collection lives at `postman/neon-academy.postman_collection.json`, mirroring the same routes as the OpenAPI spec. If they ever disagree, the OpenAPI spec (generated straight from the running code) is the source of truth — reconcile the Postman collection to match it, not the other way around.
