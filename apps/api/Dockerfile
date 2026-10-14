FROM node:20-alpine AS base
RUN npm install -g pnpm@9.1.0

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter api db:generate
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app/apps/api
ENV NODE_ENV=production
ENV NODE_PATH=/app/node_modules
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/dist /app/apps/api/dist
COPY --from=builder /app/apps/api/prisma /app/apps/api/prisma
COPY --from=builder /app/apps/api/package.json /app/apps/api/package.json

EXPOSE 3001
CMD ["node", "dist/apps/api/src/main"]
