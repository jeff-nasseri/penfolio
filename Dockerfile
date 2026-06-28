# syntax=docker/dockerfile:1

# ---------- Builder ----------
FROM node:22-bookworm AS builder
WORKDIR /app

# Install dependencies first for better layer caching.
COPY apps/api/package*.json apps/api/
RUN npm ci --prefix apps/api

COPY apps/web/package*.json apps/web/
RUN npm ci --prefix apps/web

# Copy the rest of the sources.
COPY tsconfig.base.json ./
COPY libs ./libs
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# Build the API (esbuild -> dist/server.js) and the Angular app (-> dist/web/browser).
RUN npm --prefix apps/api run build
RUN npm --prefix apps/web run build

# ---------- Runtime ----------
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/app/data/penfolio.sqlite \
    WEB_DIR=/app/public

# API bundle + runtime node_modules (better-sqlite3 native binary).
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules

# Compiled Angular static assets served by the API.
COPY --from=builder /app/apps/web/dist/web/browser ./public

RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node", "dist/server.js"]
