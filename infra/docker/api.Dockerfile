# Multi-stage Dockerfile for NestJS API Server
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN cd apps/api && npx prisma generate
RUN npm run build --workspace=@cafex/shared-types
RUN npm run build --workspace=@cafex/api

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4000
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
USER nestjs
EXPOSE 4000
CMD ["node", "apps/api/dist/src/main.js"]

