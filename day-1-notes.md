# Day 1 Setup Notes

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
