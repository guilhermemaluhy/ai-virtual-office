# 0003 — Divisão em apps e packages

- **Status:** Aceito
- **Data:** 2026-10-08

## Decisão

| Caminho             | Responsabilidade                                                 |
| ------------------- | ---------------------------------------------------------------- |
| `apps/web`          | Frontend Next.js (App Router, React 19)                          |
| `apps/api`          | API HTTP Fastify (`GET /health`)                                 |
| `apps/worker`       | Processo de background (jobs assíncronos, filas Redis no futuro) |
| `packages/shared`   | Utilitários e tipos sem dependências de domínio (env, `Result`)  |
| `packages/db`       | Configuração/acesso ao Postgres                                  |
| `packages/ai`       | Contrato agnóstico de provedores de LLM                          |
| `packages/tools`    | Registro de ferramentas que agentes podem chamar                 |
| `packages/behavior` | Estados e regras de comportamento dos agentes                    |
| `packages/agents`   | Composição de agentes (usa ai, tools, behavior)                  |
| `packages/ui`       | Componentes React compartilhados                                 |

Regras de dependência: `shared` não depende de ninguém; `apps/*` podem depender de `packages/*`, nunca o contrário; `ui` não depende de pacotes de servidor.

## Consequências

- Na Fase 1 os pacotes contêm apenas contratos mínimos e testes; implementações reais (ORM, provedores de LLM, filas) ficam para as fases seguintes e terão ADRs próprios.
