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

# Production stage — run API source directly with Bun (no bundling, preserves Elysia macros)
FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build-shared /app/packages/shared ./packages/shared
COPY --from=build-shared /app/packages/db ./packages/db
COPY package.json ./package.json
COPY api/ ./api/
EXPOSE 3000
CMD ["bun", "run", "api/src/index.ts"]
