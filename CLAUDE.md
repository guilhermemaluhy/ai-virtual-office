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
pnpm db:migrate               # aplica migrations (packages/db/drizzle)
pnpm db:seed                  # APAGA tudo e grava organograma + loja simulada
pnpm db:generate              # gera nova migration após mudar packages/db/src/schema.ts
pnpm dev                      # web :3000, api :3001, worker
```

Filtrar um pacote: `pnpm turbo run test --filter=@aivo/api`.

## Convenções

- Pacotes internos: escopo `@aivo/*`, dependências `workspace:*`, consumidos via `dist/` (rode `pnpm build` antes de executar um app isolado).
- Imports relativos com extensão `.js` (NodeNext). `import type` para tipos.
- Testes ao lado do código (`*.test.ts[x]`); `tsconfig.build.json` os exclui da emissão.
- Variáveis de ambiente: sempre validar com `parseEnv` (`@aivo/shared`) e documentar em `.env.example`.
- `packages/*` nunca importam de `apps/*`; `shared` não depende de outros pacotes internos.
- Vocabulário de domínio (marketplaces, cargos, estados, riscos, status) vive em `@aivo/shared/domain.ts`; enums do banco derivam dele.
- Banco: mudou o schema → `pnpm db:generate` e commit da migration. Nunca editar migration já mesclada. Dinheiro sempre em centavos (`*Cents`).
- Testes de banco/API usam `createTestDatabase()` de `@aivo/db/testing` (PGlite, sem Docker).
- Nada que altere a conta do marketplace acontece sem um registro em `approvals` e, ao decidir, em `audit_log`.
- Toda decisão arquitetural nova ganha um ADR curto em `docs/adr/`.

## Fases

| Fase | Escopo                         | Status       |
| ---- | ------------------------------ | ------------ |
| 1    | Arquitetura e setup            | ✅ Concluída |
| 2    | Domínio, banco e loja simulada | ✅ Concluída |
| 3+   | Ver `docs/SPEC.md` §8          | ⏳ Pendente  |

## Definição de pronto

Checklist aplicado ao final de cada fase (estado da Fase 2):

- [x] `docker compose up -d` sobe Postgres e Redis (healthy)
- [x] `pnpm install --frozen-lockfile` passa
- [x] `pnpm build` passa (11/11 pacotes)
- [x] `pnpm lint` passa sem erros/avisos
- [x] `pnpm typecheck` passa
- [x] `pnpm test` passa (46 testes em 11 pacotes)
- [x] `pnpm format:check` passa
- [x] `pnpm db:migrate` e `pnpm db:seed` rodam contra o Postgres do Compose (também no CI)
- [x] Prints enviados ao CEO quando há mudança visual (Fase 2: sem mudança visual)
- [x] `.env.example` atualizado com todas as variáveis usadas
- [x] ADRs registrados para as decisões tomadas
- [x] "Estado atual" atualizado neste arquivo
- [x] Commit feito na branch de trabalho

## Estado atual

**Fase 2 — Domínio, banco e loja simulada: concluída (2026-10-08).**

Entregue na Fase 2:

- `docs/SPEC.md` v0.2: organograma com 13 agentes — por marketplace (ML e Shopee) 1 Diretor, 1 Especialista Estratégico e 4 analistas (Cadastro, Ads, Afiliados, Campanhas); 1 Comprador/Analista de Estoque compartilhado; todos abaixo do CEO (humano).
- `packages/shared`: vocabulário de domínio. `packages/agents`: `ORG_CHART`, `chainOfCommand`, `directReports`.
- `packages/db`: schema Drizzle (`agents`, `products`, `listings`, `orders`, `tasks`, `approvals`, `reports`, `audit_log`), migration `0000_init`, CLI de migrate, `createTestDatabase()` com PGlite.
- `packages/marketplace`: `MarketplaceAdapter` + loja simulada determinística (100 produtos, ~190 anúncios em ML/Shopee, ~4 mil pedidos em 30 dias, rupturas e anúncios incompletos).
- `apps/api`: `GET /agents`, `/agents/:id`, `/org-chart`, `/products`, `/listings`, `/tasks`, `/approvals`, `/dashboard/summary`; `POST /approvals/:id/decision` (CEO, transacional, com auditoria); `pnpm db:seed`.
- CI: job `compose` aplica migrations e seed num Postgres real. ADRs 0007–0008.

Fase 1 (base): monorepo pnpm + Turborepo, TS estrito, apps `web`/`api`/`worker`, ESLint + Prettier, CI, Docker Compose, ADRs 0001–0006.

Ainda não feito: cena 3D (Fase 3), motor dos agentes e IA (Fase 4), dailies/painel (Fase 5), integrações reais ML/Shopee (Fases 6–7), autenticação.

Decisões em aberto: ver `docs/SPEC.md` §9 (atendimento ao cliente, responsável por preço, alçadas, horário das dailies, orçamento de IA).

Próximo passo: Fase 3 — escritório 3D com os 13 agentes, consumindo a API.
