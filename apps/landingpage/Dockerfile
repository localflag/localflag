FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Build
FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/landingpage ./apps/landingpage
RUN pnpm install --frozen-lockfile --filter landingpage
RUN pnpm --filter landingpage build

# Production
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/landingpage/dist /usr/share/nginx/html
COPY apps/landingpage/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
