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

# Build stage uses Bun for fast compilation
FROM oven/bun:1 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared/ ./packages/shared/
COPY packages/db/ ./packages/db/
COPY api/ ./api/
RUN bun run --filter @zenda/shared build
RUN bun run --filter @zenda/db build
RUN bun run --filter @zenda/api build

# Production stage uses Bun runtime
FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/api/dist/index.js ./index.js
EXPOSE 3001
CMD ["bun", "run", "index.js"]
