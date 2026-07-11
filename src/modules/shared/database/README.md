# `shared/database` — your data layer (you build this on **Day 13**)

This folder is **intentionally empty**. The Academy does not hand you a database —
you build it, because an Architect who has wired one pool by hand never misconfigures
the real one. This README is a **map, not a solution**: the shape to build and the
gaps to notice. No code here on purpose.

> 🕳️ **Discovery-gap rules apply.** The warnings below are questions, not answers.
> When something feels missing, it is. Find out *why* before you write the line.

## The shape you'll assemble (Day 13)

- A global `DatabaseModule` that builds one connection pool + a drizzle instance and
  exposes it through a **DI token** (`DATABASE_TOKENS.DRIZZLE`) — never an imported client.
- `schema/` — **one file per table** + a barrel `index.ts`.
- Row types come from the schema (`$inferSelect` / `$inferInsert`) — hand-written entity
  interfaces are forbidden.
- Repositories inject the token and own **every** query. `db.` never appears in a
  `*.service.ts` (the `lint:no-db-in-service` guard proves it).

## Model before you code (design-first)

Before a single `pgTable(...)`, model the data: entities, relationships, cardinality,
normalization (1NF–3NF — and when to *deliberately* denormalize). Draw the ERD in a
modeling tool (see the Toolbox) and keep it in your notes. The schema is the *output*
of a design, not the design itself.

## Gaps to notice (don't skip — each one bites in production)

- **Numbers that aren't numbers.** A `numeric`/`decimal` column comes back from the
  driver as *what* JavaScript type? Sort a list by a score column and watch. Where do
  you convert it — and why the repository boundary?
- **Primary keys.** `uuid` (defaultRandom) vs an auto-increment identity `integer` —
  what does each cost you (guessability, ordering, size, merging across environments)?
- **Time.** A timestamp column without `withTimezone` / `mode` — what breaks when the
  server and the client disagree about "now"? How does `updatedAt` update itself?
- **Enums.** A role column as `pgEnum` vs `text` — adding a value is easy; try
  *removing* or reordering one later. Which cost do you want to sign up for?
- **The driver question (we run Cloud SQL / RDS in prod, not Neon).** Your app is a
  long-running server → which Postgres driver is correct? Day 13 has you call
  `db.transaction()` — does *every* driver support interactive transactions? (One
  popular serverless HTTP driver silently does not.) One `pg` driver speaks to both a
  dev Neon branch and prod Cloud SQL/RDS — why?
- **Connections aren't free.** Cloud SQL/RDS have a `max_connections` ceiling. Put your
  pool behind serverless compute that scales to many instances and multiply. What is a
  connection proxy (Cloud SQL Auth Proxy / RDS Proxy / PgBouncer) actually solving?
- **Migrations.** `drizzle-kit generate` (versioned SQL) vs `push` — which for shared
  work, which for local scratch? Which connection do migrations use — pooled or direct?

## Verify (Day 13)

`pnpm lint:check` stays green (the DB-token guard passes). Soft-deleted rows disappear
from lists but stay in the table. A two-step write in `db.transaction()` rolls back as
one. No `db.` outside a `*.repository.ts`.

→ Full brief: **Day 13 — The Data Protocol** in the Academy handbook.
