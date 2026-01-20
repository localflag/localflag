FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Build
FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/react ./packages/react
COPY apps/demo ./apps/demo
RUN pnpm install --frozen-lockfile --filter demo...
RUN pnpm --filter @localflag/react build
RUN pnpm --filter demo build

# Production
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/demo/dist /usr/share/nginx/html
COPY apps/demo/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
