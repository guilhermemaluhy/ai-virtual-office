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
- Mudança de preço (`listing.change_price`): proposta pelo Especialista Estratégico, risco `high`, **sempre** aprovada pelo CEO — nunca delegável (`ceoOnly` em `packages/tools`).
- Agentes: regras de negócio em `packages/agents/src/engine/analyzers.ts` (determinísticas, testadas); a IA (Claude) só conversa e nunca executa ações. Ação nova = entrada em `ACTIONS` (risco, proponentes) + tratamento em `applyAction` + teste.
- IA: `ANTHROPIC_API_KEY` só no servidor (`apps/api`). Sem chave → modo offline. Modelo padrão `claude-opus-5-5` (`AI_MODEL`), esforço `low` (`AI_EFFORT`).
- Toda decisão arquitetural nova ganha um ADR curto em `docs/adr/`.

## Fases

| Fase | Escopo                         | Status       |
| ---- | ------------------------------ | ------------ |
| 1    | Arquitetura e setup            | ✅ Concluída |
| 2    | Domínio, banco e loja simulada | ✅ Concluída |
| 3    | Escritório 3D (visual)         | ✅ Concluída |
| 4    | Motor dos agentes + IA         | ✅ Concluída |
| 5+   | Ver `docs/SPEC.md` §8          | ⏳ Pendente  |

## Definição de pronto

Checklist aplicado ao final de cada fase (estado da Fase 4):

- [x] `docker compose up -d` sobe Postgres e Redis (healthy)
- [x] `pnpm install --frozen-lockfile` passa
- [x] `pnpm build` passa (11/11 pacotes)
- [x] `pnpm lint` passa sem erros/avisos
- [x] `pnpm typecheck` passa
- [x] `pnpm test` passa (92 testes em 11 pacotes)
- [x] `pnpm format:check` passa
- [x] `pnpm db:migrate` (migration `0001_dedupe_keys`) e `pnpm db:seed` rodam contra o Postgres do Compose (também no CI)
- [x] Ponta a ponta: seed → ciclo gera tarefas/pedidos → aprovar preço altera o anúncio e audita → chat responde (modo offline); prints enviados e link de demonstração atualizado
- [ ] Chat com Claude real testado com chave do CEO (sem chave neste ambiente; coberto por testes com cliente simulado)
- [x] `.env.example` atualizado com todas as variáveis usadas
- [x] ADRs registrados para as decisões tomadas
- [x] "Estado atual" atualizado neste arquivo
- [x] Commit feito na branch de trabalho

## Estado atual

**Fase 4 — Motor dos agentes + IA: concluída (2026-10-08).**

Entregue na Fase 4:

- `packages/tools`: catálogo de ações (`ACTIONS`) com risco, proponentes e `ceoOnly`; `routeAction` (executar × pedir aprovação).
- `packages/agents`: regras por cargo (estoque, preço/margem/conversão, cadastro, ads, afiliados, calendário de campanhas, atendimento); `runCycle` transacional com deduplicação, auditoria e estados do escritório; `applyAction` (preço e compra alteram a loja simulada); chat (`chatWithAgent`) com prompt por cargo e resposta offline.
- `packages/ai`: `AnthropicProvider` (SDK oficial, `claude-opus-5-5`, _fallbacks_ de recusa) e modo offline; `createLlmProvider` escolhe pela presença de `ANTHROPIC_API_KEY`.
- `packages/db`: migration `0001_dedupe_keys` (coluna `key` em tarefas e aprovações).
- `apps/api`: `POST /agents/:id/chat`, `POST /cycle/run`, `GET /ai/status`; aprovar um pedido executa a ação; seed roda o primeiro ciclo (11 pedidos e 12 tarefas reais a partir da loja).
- `apps/worker`: ciclo dos agentes a cada `AGENT_CYCLE_MS` (10 min).
- `apps/web`: chat no painel do agente (mostra "IA" ou "modo offline"), botão "Rodar ciclo dos agentes"; demonstração atualizada.
- ADR 0010.

Fase 3 (escritório 3D): cena isométrica com os 15 agentes, estados vindos da API, painéis e caixa de aprovações, modo demonstração publicado como link privado.
Fase 2 (base de dados): vocabulário de domínio, organograma de 15 agentes, schema Drizzle + migrations, loja simulada (100 produtos, ML + Shopee), API de leitura e aprovações com auditoria, seed. Fase 1: monorepo, CI, Docker Compose.

Demonstração sem servidor (link para o CEO): `pnpm --filter @aivo/web demo:snapshot` (com a API rodando e o seed feito) atualiza `apps/web/demo/snapshot.json`; `pnpm --filter @aivo/web build:demo` gera `apps/web/demo/dist/` (HTML + JS + CSS) publicado como Artifact privado. Decisões na demo ficam só na aba do navegador.

Para ver localmente: `docker compose up -d --wait && pnpm build && pnpm db:migrate && pnpm db:seed`, depois `pnpm --filter @aivo/api start` e `pnpm --filter @aivo/web start` → http://localhost:3000.

Ainda não feito: dailies e relatórios (Fase 5), integrações reais ML/Shopee (Fases 6–7), autenticação (Fase 8). Chat com Claude real depende da chave do CEO. Melhorias visuais anotadas: etiquetas densas no celular; animação de caminhada até a sala de reunião.

Decisões em aberto: ver `docs/SPEC.md` §10 (alçadas, horário das dailies, orçamento de IA).

Próximo passo: Fase 5 — dailies por marketplace (Diretor conduz na sala de reunião), resumo do CEO, histórico de decisões/auditoria no painel.
