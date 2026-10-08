# CLAUDE.md

Guia para agentes (Claude Code) trabalhando neste repositório.

> Especificação: [`docs/SPEC.md`](docs/SPEC.md) (produto e fases) e [`docs/SPEC_3D.md`](docs/SPEC_3D.md) (escritório 3D). **Status: v0.2** — organograma (13 agentes, ML + Shopee) definido pelo CEO.

## Stack

- Node ≥ 22.12 (`.nvmrc`), pnpm 10 (`packageManager`), Turborepo 2
- TypeScript 5.9 estrito, ESM
- `apps/web` Next.js 16 + React 19 · `apps/api` Fastify 5 · `apps/worker` Node
- ESLint 10 (typescript-eslint strictTypeChecked) · Prettier 3 · Vitest 3
- Postgres 17 + Redis 7 via Docker Compose

Decisões em [`docs/adr/`](docs/adr/README.md).

## Comandos

```bash
cp .env.example .env
docker compose up -d --wait   # Postgres + Redis
pnpm install
pnpm build                    # turbo run build
pnpm lint                     # eslint type-aware em todos os pacotes
pnpm typecheck
pnpm test                     # vitest em todos os pacotes
pnpm format                   # prettier --write
pnpm dev                      # web :3000, api :3001, worker
```

Filtrar um pacote: `pnpm turbo run test --filter=@aivo/api`.

## Convenções

- Pacotes internos: escopo `@aivo/*`, dependências `workspace:*`, consumidos via `dist/` (rode `pnpm build` antes de executar um app isolado).
- Imports relativos com extensão `.js` (NodeNext). `import type` para tipos.
- Testes ao lado do código (`*.test.ts[x]`); `tsconfig.build.json` os exclui da emissão.
- Variáveis de ambiente: sempre validar com `parseEnv` (`@aivo/shared`) e documentar em `.env.example`.
- `packages/*` nunca importam de `apps/*`; `shared` não depende de outros pacotes internos.
- Toda decisão arquitetural nova ganha um ADR curto em `docs/adr/`.

## Fases

| Fase | Escopo                | Status       |
| ---- | --------------------- | ------------ |
| 1    | Arquitetura e setup   | ✅ Concluída |
| 2+   | Ver `docs/SPEC.md` §7 | ⏳ Pendente  |

## Definição de pronto

Checklist aplicado ao final de cada fase (estado da Fase 1):

- [x] `docker compose up -d` sobe Postgres e Redis (healthy; `select 1` e `PING` verificados)
- [x] `pnpm install --frozen-lockfile` passa
- [x] `pnpm build` passa (10/10 pacotes)
- [x] `pnpm lint` passa sem erros/avisos
- [x] `pnpm typecheck` passa
- [x] `pnpm test` passa (21 testes em 10 pacotes)
- [x] `pnpm format:check` passa
- [x] CI (GitHub Actions) configurado com lint, typecheck, build, testes e verificação do Compose
- [x] `.env.example` atualizado com todas as variáveis usadas
- [x] ADRs registrados para as decisões tomadas
- [x] "Estado atual" atualizado neste arquivo
- [x] Commit feito na branch de trabalho

## Estado atual

**Fase 1 — Arquitetura e setup: concluída (2026-10-08).**

Entregue:

- Monorepo pnpm + Turborepo, TypeScript estrito (`tsconfig.base.json`).
- Apps: `web` (Next.js, página inicial usando `@aivo/ui`), `api` (Fastify, `GET /health`), `worker` (loop de ticks sem sobreposição, desligamento gracioso em SIGINT/SIGTERM).
- Packages com contratos mínimos e testes: `shared` (`parseEnv`, `Result`), `db` (`getDatabaseConfig` a partir de `DATABASE_URL`), `ai` (`LlmProvider`, `EchoProvider`), `tools` (`ToolRegistry`), `behavior` (`AgentState`), `agents` (`createAgent`), `ui` (`Button`).
- ESLint + Prettier, CI (`.github/workflows/ci.yml`), `docker-compose.yml`, `.env.example`, ADRs 0001–0006.

Ainda não feito (fases seguintes): escolha de ORM/migrations, provedores reais de LLM, filas Redis no worker, cena 3D no web, autenticação.

Próximo passo: Fase 2 — domínio, banco e loja simulada.
