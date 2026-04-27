FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY web/package.json ./web/
RUN npm ci --workspace @zenda/web

# Build shared package
FROM base AS build-shared
COPY --from=deps /app/node_modules ./node_modules
COPY packages/shared/ ./packages/shared/
RUN npm run --workspace @zenda/shared build

# Build web
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build-shared /app/packages/shared ./packages/shared/
COPY web/ ./web/

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run --workspace @zenda/web build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=build /app/web/public ./public
COPY --from=build --chown=nextjs:nodejs /app/web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
