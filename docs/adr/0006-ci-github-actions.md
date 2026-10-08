# 0006 — CI no GitHub Actions

- **Status:** Aceito
- **Data:** 2026-10-08

## Decisão

Workflow `.github/workflows/ci.yml` em push para `main` e em pull requests:

1. Job `ci`: `pnpm install --frozen-lockfile` → `format:check` → `lint` → `typecheck` → `build` → `test` (Node da `.nvmrc`, cache do pnpm).
2. Job `compose`: sobe Postgres e Redis com `docker compose up -d --wait` e verifica `select 1` e `PING`.

## Consequências

- O lockfile precisa estar atualizado no commit.
- Execuções antigas do mesmo ref são canceladas (`concurrency`).
