# Production image for the Express backend ONLY (server.ts + auth.ts +
# database.ts + users.ts + oauth.ts + serviceDiscovery.ts). The Next.js
# frontend is deployed separately on Vercel (see ../../DEPLOYMENT.md), so
# this image never runs `next build`/`next start` - that keeps the image
# smaller and the build faster than the repo-root Dockerfile, which is
# local-dev-only (`npm run dev`, hot-reload via ts-node-dev, used by
# docker-compose.yml) and isn't what should run in a real deployment.
#
# Builds with yarn, matching this repo's committed lockfile (yarn.lock,
# see package.json's "packageManager" field) - not npm/package-lock.json,
# which this repo doesn't have.

FROM node:18-slim AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
# Backend-only build: tsconfig.server.json compiles server.ts and its
# direct dependencies to build/ - see package.json's "build" script.
RUN yarn tsc -p tsconfig.server.json

FROM node:18-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
# --production skips devDependencies (typescript, jest, ts-node-dev, ...) -
# none of them are needed to run the already-compiled output below.
RUN yarn install --frozen-lockfile --production && yarn cache clean
COPY --from=build /app/build ./build

EXPOSE 5001
CMD ["node", "build/server.js"]
