# Deps stage uses Node for npm ci (reliable for large monorepos)
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY packages/db/prisma/ ./packages/db/prisma/
COPY packages/db/prisma.config.ts ./packages/db/
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
RUN cd packages/db && bunx prisma generate
RUN bun run --filter @zenda/db build

# Production stage — run API source directly with Bun
FROM oven/bun:1 AS runner
WORKDIR /app
ARG DATABASE_URL
ENV NODE_ENV=production
ENV DATABASE_URL=$DATABASE_URL
RUN echo "Build $(date +%s)" > /buildinfo
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build-shared /app/packages/shared ./packages/shared
COPY --from=build-shared /app/packages/db ./packages/db
COPY --from=build-shared /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json ./package.json
COPY api/ ./api/
EXPOSE 3001

# Run migrations using Prisma Migrate, then start API.
CMD ["sh", "-c", "echo '[startup] Running DB migrations...' && cd packages/db && bunx prisma migrate deploy && echo '[startup] Migrations complete. Starting API...' && cd /app && exec bun run api/src/index.ts"]
