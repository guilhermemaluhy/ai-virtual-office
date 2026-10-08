# 0003 — Divisão em apps e packages

- **Status:** Aceito
- **Data:** 2026-10-08

## Decisão

| Caminho                | Responsabilidade                                                              |
| ---------------------- | ----------------------------------------------------------------------------- |
| `apps/web`             | Frontend Next.js (App Router, React 19)                                       |
| `apps/api`             | API HTTP Fastify (leitura, aprovações, seed)                                  |
| `apps/worker`          | Processo de background (jobs assíncronos, filas Redis no futuro)              |
| `packages/shared`      | Vocabulário de domínio (marketplaces, cargos, estados, riscos), env, `Result` |
| `packages/db`          | Schema Drizzle, migrations e acesso ao Postgres (ADR 0007)                    |
| `packages/marketplace` | `MarketplaceAdapter` e loja simulada (ADR 0008)                               |
| `packages/ai`          | Contrato agnóstico de provedores de LLM                                       |
| `packages/tools`       | Registro de ferramentas que agentes podem chamar                              |
| `packages/behavior`    | Estados e regras de comportamento dos agentes                                 |
| `packages/agents`      | Organograma (13 agentes) e composição de agentes (usa ai, tools)              |
| `packages/ui`          | Componentes React compartilhados                                              |

Regras de dependência: `shared` não depende de ninguém (é a fonte do vocabulário de domínio: marketplaces, cargos, estados, riscos); `apps/*` podem depender de `packages/*`, nunca o contrário; `ui` não depende de pacotes de servidor.

## Consequências

- Na Fase 1 os pacotes contêm apenas contratos mínimos e testes; implementações reais (ORM, provedores de LLM, filas) ficam para as fases seguintes e terão ADRs próprios.
