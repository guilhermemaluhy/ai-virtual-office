# 0007 — Drizzle ORM, migrations SQL e PGlite nos testes

- **Status:** Aceito
- **Data:** 2026-10-08

## Contexto

A Fase 2 precisa de modelo de dados, migrations versionadas e testes de API que rodem rápido no CI e no computador de qualquer pessoa, sem depender de Docker.

## Decisão

- **Drizzle ORM** (`packages/db/src/schema.ts`): schema em TypeScript, tipos inferidos (`$inferSelect`), SQL explícito e sem runtime pesado.
- **drizzle-kit** gera migrations SQL em `packages/db/drizzle/` (`pnpm db:generate`); aplicadas com `pnpm db:migrate`. Migrations são commitadas e nunca editadas depois de mescladas.
- Enums do Postgres derivados das constantes de domínio em `@aivo/shared` (fonte única de verdade).
- **PGlite** (Postgres em WebAssembly, em processo) para testes: `createTestDatabase()` em `@aivo/db/testing` aplica as mesmas migrations. Produção usa `node-postgres`.
- A API recebe um `Database` agnóstico de driver, então os mesmos handlers rodam com PGlite (testes) e `pg` (produção).
- Agentes usam ids estáveis legíveis (`ml-diretor`); as demais tabelas usam UUID. Dinheiro em centavos (`integer`).

## Consequências

- Testes de banco/API rodam com `pnpm test`, sem serviços externos. O CI ainda valida migrations + seed num Postgres real (job `compose`).
- PGlite é Postgres de verdade, mas extensões nativas podem não existir nele; se uma for necessária, os testes afetados passam a usar o Postgres do Compose.
