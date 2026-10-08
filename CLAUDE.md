# CLAUDE.md

Guia para agentes (Claude Code) trabalhando neste repositório.

> Especificação: [`docs/SPEC.md`](docs/SPEC.md) (produto e fases) e [`docs/SPEC_3D.md`](docs/SPEC_3D.md) (escritório 3D). **Status: v0.3** — organograma (15 agentes, ML + Shopee) e regra de preços definidos pelo CEO.

## Stack

- Node ≥ 22.12 (`.nvmrc`), pnpm 10 (`packageManager`), Turborepo 2
- TypeScript 5.9 estrito, ESM
- `apps/web` Next.js 16 + React 19 + React Three Fiber (escritório 3D) · `apps/api` Fastify 5 · `apps/worker` Node
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
- Escritório 3D: posições em `apps/web/lib/office/layout.ts` (testado, sem WebGL); a cena só reflete o estado da API, nunca decide nada. Mudança visual → prints para o CEO.
- Testes de banco/API usam `createTestDatabase()` de `@aivo/db/testing` (PGlite, sem Docker).
- Nada que altere a conta do marketplace acontece sem um registro em `approvals` e, ao decidir, em `audit_log`.
- Mudança de preço (`listing.change_price`): proposta pelo Especialista Estratégico, risco `high`, **sempre** aprovada pelo CEO — nunca delegável.
- Toda decisão arquitetural nova ganha um ADR curto em `docs/adr/`.

## Fases

| Fase | Escopo                         | Status       |
| ---- | ------------------------------ | ------------ |
| 1    | Arquitetura e setup            | ✅ Concluída |
| 2    | Domínio, banco e loja simulada | ✅ Concluída |
| 3    | Escritório 3D (visual)         | ✅ Concluída |
| 4+   | Ver `docs/SPEC.md` §8          | ⏳ Pendente  |

## Definição de pronto

Checklist aplicado ao final de cada fase (estado da Fase 3):

- [x] `docker compose up -d` sobe Postgres e Redis (healthy)
- [x] `pnpm install --frozen-lockfile` passa
- [x] `pnpm build` passa (11/11 pacotes)
- [x] `pnpm lint` passa sem erros/avisos
- [x] `pnpm typecheck` passa
- [x] `pnpm test` passa (60 testes em 11 pacotes)
- [x] `pnpm format:check` passa
- [x] `pnpm db:migrate` e `pnpm db:seed` rodam contra o Postgres do Compose (também no CI)
- [x] App rodando de ponta a ponta (API + web) e prints enviados ao CEO (desktop, painel do agente, aprovações, celular)
- [x] `.env.example` atualizado com todas as variáveis usadas
- [x] ADRs registrados para as decisões tomadas
- [x] "Estado atual" atualizado neste arquivo
- [x] Commit feito na branch de trabalho

## Estado atual

**Fase 3 — Escritório 3D: concluída (2026-10-08).**

Entregue na Fase 3:

- `apps/web`: escritório 3D isométrico (React Three Fiber) com Sala do CEO, alas Mercado Livre (amarela) e Shopee (laranja), sala de reunião envidraçada, estoque com prateleiras e os 15 avatares em suas mesas (cor por marketplace, acessórios por cargo: gravata, óculos, headset).
- Estados visuais vindos da API: trabalhando (digitando, monitor aceso, balão com a tarefa), aguardando aprovação ("! aprovação"), disponível, em reunião (vai para a mesa redonda), alerta, offline.
- Barra superior com faturamento/pedidos 30 dias por marketplace, estoque e aprovações pendentes; painel do agente (status, chefe, tarefas, pendências); caixa de aprovações com **Aprovar/Recusar** funcionando; mural de aprovações clicável na Sala do CEO; zoom adaptado a celular; fallback 2D sem WebGL.
- `apps/api`: CORS para o web (`WEB_ORIGIN`); seed define o estado inicial dos agentes a partir de tarefas e aprovações.
- ADR 0009.

Fase 2 (base de dados): vocabulário de domínio, organograma de 15 agentes, schema Drizzle + migrations, loja simulada (100 produtos, ML + Shopee), API de leitura e aprovações com auditoria, seed. Fase 1: monorepo, CI, Docker Compose.

Demonstração sem servidor (link para o CEO): `pnpm --filter @aivo/web demo:snapshot` (com a API rodando e o seed feito) atualiza `apps/web/demo/snapshot.json`; `pnpm --filter @aivo/web build:demo` gera `apps/web/demo/dist/` (HTML + JS + CSS) publicado como Artifact privado. Decisões na demo ficam só na aba do navegador.

Para ver localmente: `docker compose up -d --wait && pnpm build && pnpm db:migrate && pnpm db:seed`, depois `pnpm --filter @aivo/api start` e `pnpm --filter @aivo/web start` → http://localhost:3000.

Ainda não feito: motor dos agentes e IA (Fase 4), dailies/painel completo (Fase 5), integrações reais ML/Shopee (Fases 6–7), autenticação. Melhorias visuais anotadas: etiquetas densas no celular; animação de caminhada até a sala de reunião.

Decisões em aberto: ver `docs/SPEC.md` §10 (alçadas, horário das dailies, orçamento de IA).

Próximo passo: Fase 4 — motor dos agentes + IA (ciclo de trabalho, ferramentas com risco, alçadas, chat com agente).
