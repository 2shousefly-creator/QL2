FROM oven/bun:1.3.3 AS bun
FROM node:24-bookworm-slim AS builder
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
# Explicit source allowlist: no arbitrary root files, credentials or local artifacts.
COPY index.html tsconfig.json vite.web.config.ts server.web.ts ./
COPY src ./src
COPY public ./public
COPY assets ./assets
ARG BUILD_ID
ARG BUILD_PUBLISHED_AT
RUN bun run build:web

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
# Web server uses only Node built-ins; no node_modules are needed at runtime.
COPY --from=builder --chown=node:node /app/dist-web ./dist-web
USER node
EXPOSE 8080
CMD ["node", "dist-web/server.mjs"]
