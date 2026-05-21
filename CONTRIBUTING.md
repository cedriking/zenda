# Contributing to Zenda

## Setup

Prerequisites: Node.js 22, Bun, Docker, PostgreSQL 16, Redis 7.

```bash
# Install dependencies
npm ci

# Start dev services (Postgres + Redis)
docker compose up -d

# Run database migrations
npm run db:migrate

# Start all workspaces in dev mode
npm run dev
```

## Development workflow

### Branch naming

- `feat/short-description` — new features
- `fix/short-description` — bug fixes
- `refactor/short-description` — refactors
- `chore/short-description` — config, tooling, infra

### Commit messages

Use imperative mood: `Add appointment rescheduling`, not `Added appointment rescheduling`.

### PR process

1. Create a branch from `main`
2. Make your changes with tests
3. Run `npm run check && npm run lint && npm run test` locally
4. Open a PR against `main` — CI must pass before merge
5. At least one approval required (see branch protection)

### CI pipeline

Every PR runs four parallel jobs (target: under 5 minutes):

| Job | What it checks |
|-----|---------------|
| **Lint** | Biome lint across all workspaces |
| **Type Check** | `tsc --noEmit` in every workspace |
| **Test** | Bun test (API) + Vitest (app) |
| **Docker Build** | API and Web Dockerfiles compile successfully |

A PR with a type error, lint error, or failing test cannot be merged.

### Branch protection (recommended)

Configure in GitHub repo Settings > Branches > Branch protection rules for `main`:

- **Require status checks to pass**: Lint, Type Check, Test, Build API Docker Image, Build Web Docker Image
- **Require branches to be up to date** before merging
- **Require pull request reviews** (1 approval)
- **Require linear history** (no merge commits)

## Project structure

```
zenda/
├── api/            # Elysia (Bun) REST API — port 3001
├── app/            # Electron + React desktop client
├── web/            # Next.js 15 marketing site — port 3000
├── packages/
│   ├── db/         # Drizzle ORM (PostgreSQL schema + client)
│   └── shared/     # Shared types, schemas, constants, i18n
├── docker-compose.yml       # Dev services (Postgres, Redis)
└── docker-compose.prod.yml  # Production stack
```

## Useful commands

```bash
npm run dev          # Start all workspaces
npm run build        # Build all workspaces
npm run test         # Run all tests
npm run lint         # Biome lint check
npm run check        # TypeScript type check (all workspaces)
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Drizzle Studio (DB browser)
```

## Code review guidelines

**Reviewers should check:**
- Correctness — does the change do what the PR says?
- Error handling — are edge cases covered?
- Security — no secrets, no injection vectors, proper auth checks
- Database safety — migrations have rollback paths, no destructive schema changes
- Test coverage — critical paths (auth, billing, WhatsApp, appointments) have tests

**Authors should:**
- Keep PRs small and focused (< 400 lines changed is ideal)
- Write a clear summary and test plan
- Respond to review feedback with fixes, not arguments
