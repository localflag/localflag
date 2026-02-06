FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Build
FROM base AS builder
ARG PUBLIC_UMAMI_URL
ARG PUBLIC_UMAMI_ID
ARG PUBLIC_UMAMI_DEBUG
ARG PUBLIC_UMAMI_LAZY_LOAD
ENV PUBLIC_UMAMI_URL=$PUBLIC_UMAMI_URL \
    PUBLIC_UMAMI_ID=$PUBLIC_UMAMI_ID \
    PUBLIC_UMAMI_DEBUG=$PUBLIC_UMAMI_DEBUG \
    PUBLIC_UMAMI_LAZY_LOAD=$PUBLIC_UMAMI_LAZY_LOAD
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
