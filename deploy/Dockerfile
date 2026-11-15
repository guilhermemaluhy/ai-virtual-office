# Imagem única para a API e o worker (o compose escolhe o comando).
# Build: docker build -f deploy/Dockerfile -t escritorio-ia .
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH CI=1
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /app

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json turbo.json ./
COPY apps/api/package.json apps/api/
COPY apps/worker/package.json apps/worker/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY packages/ai/package.json packages/ai/
COPY packages/tools/package.json packages/tools/
COPY packages/agents/package.json packages/agents/
COPY packages/behavior/package.json packages/behavior/
RUN pnpm install --frozen-lockfile --filter @aivo/api... --filter @aivo/worker...
COPY apps/api apps/api
COPY apps/worker apps/worker
COPY packages/shared packages/shared
COPY packages/db packages/db
COPY packages/ai packages/ai
COPY packages/tools packages/tools
COPY packages/agents packages/agents
COPY packages/behavior packages/behavior
COPY supabase/migrations supabase/migrations
RUN pnpm turbo run build --filter=@aivo/api... --filter=@aivo/worker...
RUN pnpm prune --prod

FROM base AS runtime
ENV NODE_ENV=production
RUN groupadd --system app && useradd --system --gid app --home /app app
COPY --from=build --chown=app:app /app /app
USER app
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
