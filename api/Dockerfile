FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY api/package.json ./api/
RUN bun install

# Build shared packages and API
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared/ ./packages/shared/
COPY packages/db/ ./packages/db/
COPY api/ ./api/
RUN bun run --filter @zenda/shared build
RUN bun run --filter @zenda/db build
RUN bun run --filter @zenda/api build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/api/dist/index.js ./index.js
COPY --from=build /app/api/drizzle ./drizzle
COPY --from=build /app/packages/db/src ./packages/db/src

EXPOSE 3001

CMD ["bun", "run", "index.js"]
