# Neon Academy — NestJS Starter

The starting point for the Neon Academy 20-day backend onboarding (Day 11). This repo exists so you do **not** spend your first backend day hand-assembling tooling: the full Neon Apps chain — oxlint, oxfmt, commitlint, husky, and the custom type-safety guard scripts — is already wired up. You clone it, run it, and spend your time learning **what each tool enforces and why**, instead of fighting configuration. The app itself is deliberately tiny: a health endpoint and one reference module showing the controller → service → repository layering you will use everywhere. No auth, no database, no Redis yet — those get wired later in the program.

## What's inside

| Tool                                     | What it enforces                                                                    | Why                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [oxlint](https://oxc.rs)                 | Lint rules incl. `no-explicit-any`, `prefer-const`, unused vars                     | Catches bugs and type-safety escapes before review does               |
| [oxfmt](https://oxc.rs)                  | One formatting style (single quotes, 80 cols, trailing commas)                      | Zero formatting debates; diffs show logic, not whitespace             |
| TypeScript `strict`                      | `noImplicitAny`, `noUncheckedIndexedAccess`, unused locals/params                   | The compiler proves things so you don't have to                       |
| commitlint                               | [Conventional Commits](https://www.conventionalcommits.org) message format          | Readable history; changelogs and release notes for free               |
| husky + lint-staged                      | Runs lint/format/guards on staged files at commit time                              | Broken code never even reaches a commit                               |
| `scripts/check-untyped-promise.mjs`      | No `Promise<void\|any\|unknown\|undefined>` in prod code                            | An untyped promise hides what an async function produces              |
| `scripts/check-unsanctioned-unknown.mjs` | Every `: unknown` must be a marked, validated boundary                              | `unknown` is for real input boundaries, not for silencing the checker |
| grep guards (in `package.json`)          | No `as unknown as`, no `as never`, one DTO class per file, no DB tokens in services | The cheap way out of a type error is not available                    |

## Quickstart

```bash
fnm use              # picks Node 24 from .node-version (or: nvm use 24)
corepack enable      # makes the pinned pnpm version available
pnpm install         # also installs the git hooks (prepare: husky)
pnpm start:dev       # http://localhost:3000/health -> { "status": "ok", ... }
pnpm lint:check      # the full guard chain — must be green before every push
docker compose up -d # optional: local Postgres + Redis (wired on Day 13/19)
```

Copy `.env.example` to `.env` if you want to change `PORT`. The DB/Redis/JWT entries are commented out on purpose — they get wired later in the program.

## The guard chain explained

`pnpm lint:check` runs all of these; each one exists because someone once shipped the bug it prevents.

- **no-any** (`oxlint`) — `any` turns the type checker off for everything it touches; type it properly.
- **no-double-cast** — `x as unknown as Y` is lying to the compiler twice; forbidden in production code.
- **no-prod-never** — `as never` casts are forbidden in production code; use literal union types.
- **no-untyped-promise** — `Promise<void|any|unknown|undefined>` is banned; declare the real resolved type. A deliberate no-result promise needs a `// void-ok` comment (see `src/main.ts` for the canonical example).
- **no-unsanctioned-unknown** — a `: unknown` is only allowed at a genuine input boundary and must carry a `// boundary: validated` comment; everywhere else, narrow it to a concrete type.
- **one-class-per-file** — more than one `export class` in a `*.dto.ts` fails; nested DTOs get their own files.
- **no-db-in-service** — DB tokens (`DATABASE_TOKENS`/`DRIZZLE`) in a `*.service.ts` fail; all storage access lives in repositories.

## Project layout

Code is grouped by **audience** — who calls it decides where it lives. Controllers live by audience; domain logic lives by domain. This mirrors the production codebases you will work in.

```
src/
├── main.ts                        # bootstrap + global ValidationPipe
├── app.module.ts                  # root module: wires everything together
└── modules/
    ├── _template/todo/            # REFERENCE module — copy this layout
    │   ├── todo.controller.ts     #   HTTP shape only, no logic
    │   ├── todo.service.ts        #   business logic, never touches storage
    │   ├── todo.repository.ts     #   the ONLY layer that touches storage
    │   ├── dto/create-todo.dto.ts #   validated request body (class-validator)
    │   ├── interfaces/            #   exported types, one per file
    │   └── todos.module.ts
    ├── platform/health/           # infra-as-feature: GET /health
    ├── shared/                    # cross-cutting: common/{decorators,filters,
    │   └── ...                    #   guards,interceptors,dto,errors,utils}, database/
    ├── user/                      # end-user features (empty — you build these)
    └── admin/                     # admin controllers (empty — you build these)
```

## Try to break it

The tooling is meant to push back. Prove it works:

1. **Bad commit message** — `git commit --allow-empty -m "bad message"` → commitlint rejects it. Retry with `git commit --allow-empty -m "chore: testing hooks"` → passes.
2. **Add an `any`** — put `const x: any = 1;` anywhere in `src/` and run `pnpm lint:check` → oxlint fails with `no-explicit-any`. Remove it, green again.
3. **Untyped promise** — change a return type to `Promise<void>` without a `// void-ok` comment → `lint:no-untyped-promise` fails and tells you exactly where.
4. **DB token in a service** — write the string `DRIZZLE` inside `todo.service.ts` → `lint:no-db-in-service` fails. Storage belongs in the repository.
