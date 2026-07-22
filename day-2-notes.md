# Day 2 Setup Notes

## Config Files

- **.editorconfig**: Standardizes basic editor behavior (indentation, line endings, charset) before the formatter even runs, so every contributor's editor produces files with the same baseline rules.
- **.oxfmtrc.json**: Defines oxfmt's code formatting rules (single quotes, 80-char print width, trailing commas) to keep code style consistent.
- **commitlint.config.cjs**: Tells commitlint to use the standard Conventional Commits rule set to validate commit messages.
- **.oxlintrc.json**: Defines which oxlint rules are enforced and at what severity; e.g. the no-explicit-any rule rejects any usage of the `any` type as a lint error.
- **.husky/commit-msg**: Runs commitlint as soon as a commit message is written, rejecting messages that don't follow Conventional Commits.
- **.husky/pre-commit**: Runs lint-staged right before a commit completes, linting/formatting only the staged (changed) files.
- **lint:check script chain**: Runs oxlint's general rules plus custom scripts that forbid unsafe type casts (as unknown as, as never), enforce one-class-per-DTO-file, and block direct DB access in service files; the chain stops at the first failure.

## Guard Scripts

- **check-untyped-promise.mjs**: Forbids vague Promise return types (Promise<void|unknown|undefined|any>); a deliberate exception can be marked with a `// void-ok` comment.
- **check-unsanctioned-unknown.mjs**: Forbids `: unknown` usage everywhere except validator/type-guard/exception-filter/audit files; a legitimate boundary must be marked with `// boundary: validated`.

## Sabotage Drill Results

- Bad commit message ("fixed stuff") → rejected by commitlint with type-empty and subject-empty errors; the husky commit-msg hook blocked the commit.
- `const x: any = 1` → caught by oxlint's no-explicit-any rule, which suggested using `unknown` instead.
- A second `export class` added to a `.dto.ts` file → caught by the lint:no-multi-class-dto script with a "more than one exported class" error (note: this check only scans `*.dto.ts` files).
- All three sabotages were reverted with `git checkout` / `git restore --staged`, returning the working tree to a clean state.

## `_template/todo` Trace: `POST /todos`

- **DTO (`create-todo.dto.ts`)**: runs before the controller method body even executes — the global `ValidationPipe` checks the incoming body against the `@IsString()` / `@IsNotEmpty()` decorators and auto-rejects invalid requests with a 400. Responsibility ends at "is the shape of this request valid?".
- **Controller (`todo.controller.ts`)**: pure HTTP shape — declares the route (`@Post()`), pulls the validated `dto` out of the request body, and forwards it to the service. Contains no conditionals, no storage access, no business rules. Responsibility ends at "translate HTTP in, HTTP out."
- **Service (`todo.service.ts`)**: owns the business rules — e.g. `dto.title.trim()` before persisting. Never touches storage directly and never builds an HTTP response; it calls the repository and returns a plain domain object. Responsibility ends at "what should happen to this data?"
- **Repository (`todo.repository.ts`)**: the only layer allowed to touch storage (currently an in-memory array; swapped for Postgres on Day 13 without the service or controller changing). Responsibility ends at "where/how is this data stored?"
- **Module (`todos.module.ts`)**: no logic — just declares which controller/providers belong to this feature so Nest's dependency injection can wire them together.
