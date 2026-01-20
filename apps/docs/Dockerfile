FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Build
FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/docs ./apps/docs
RUN pnpm install --frozen-lockfile --filter docs
RUN pnpm --filter docs build

# Production
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/docs/dist /usr/share/nginx/html
COPY apps/docs/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
