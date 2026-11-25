# Production image (specs/003): built once per release tag, deployed to App Platform.
# Base images are pinned by digest (docs/guides/dependencies.md).

FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@12.19.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG APP_VERSION=dev
ARG SITE_URL=https://www.albertosanmartinmartinez.es
ENV APP_VERSION=$APP_VERSION SITE_URL=$SITE_URL
RUN pnpm build \
 && pnpm exec esbuild scripts/migrate.ts --bundle --platform=node --format=esm --target=node26 \
      --external:pg-native --outfile=dist/migrate.mjs \
      --banner:js="import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"

FROM node:26.13.1-alpine@sha256:6bd9ab43c0ec0190ca7b2d193906cb8b7edf6e7f4afa43ddeccd6452710bffb5 AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/drizzle ./drizzle
COPY --from=build --chown=app:app /app/dist/migrate.mjs ./migrate.mjs
USER app
EXPOSE 3000
CMD ["node", "server.js"]
