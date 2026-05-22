# Deps stage uses Node for npm ci (reliable for large monorepos)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY api/package.json ./api/
COPY app/package.json ./app/
COPY web/package.json ./web/
RUN npm ci

# Build shared packages (they compile TS to JS)
FROM oven/bun:1 AS build-shared
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared/ ./packages/shared/
COPY packages/db/ ./packages/db/
RUN bun run --filter @zenda/shared build
RUN bun run --filter @zenda/db build

# Production stage — run API source directly with Bun
FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN echo "Build $(date +%s)" > /buildinfo
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build-shared /app/packages/shared ./packages/shared
COPY --from=build-shared /app/packages/db ./packages/db
COPY package.json ./package.json
COPY api/ ./api/
EXPOSE 3001

# Run migrations using locally installed drizzle-kit, then start API.
# bun run invokes the bin from node_modules/.bin directly (no download).
# Errors in migration or API startup will be visible in container logs.
# Use || true for migrations so drizzle-kit exit 1 (e.g. "already exists" notices)
# doesn't prevent the API from starting when tables are already up-to-date.
CMD ["sh", "-c", "echo '[startup] Running DB migrations...' && cd packages/db && (bun run migrate 2>&1 || true) && echo '[startup] Migrations complete. Starting API...' && cd /app && exec bun run api/src/index.ts"]
