# --- Build: SvelteKit with adapter-node ---
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
# Same origin as the backend: Caddy routes /api/* to Spring Boot
ARG PUBLIC_API_BASE_URL=/api
ENV PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL
RUN npm run build && npm prune --omit=dev

# --- Runtime: only the build output and production dependencies ---
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    PUBLIC_API_BASE_URL=/api

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/build build

USER node
EXPOSE 3000
CMD ["node", "build"]
