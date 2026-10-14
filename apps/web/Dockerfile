FROM node:20-alpine AS base
RUN npm install -g pnpm@9.1.0

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter web build

FROM base AS runner
WORKDIR /app/apps/web
ENV NODE_ENV=production
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/web/.next /app/apps/web/.next
COPY --from=builder /app/apps/web/public /app/apps/web/public
COPY --from=builder /app/apps/web/package.json /app/apps/web/package.json

EXPOSE 3000
CMD ["npx", "next", "start"]
