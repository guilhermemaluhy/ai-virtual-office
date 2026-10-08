# 0004 — ESLint, Prettier e Vitest

- **Status:** Aceito
- **Data:** 2026-10-08

## Decisão

- **ESLint 10** com flat config única na raiz (`eslint.config.mjs`): `@eslint/js` recommended + `typescript-eslint` `strictTypeChecked` (type-aware via `projectService`) + `react-hooks` para arquivos `.tsx` de `web`/`ui`. `eslint-config-prettier` desliga regras de estilo.
- **Prettier** é a única fonte de formatação (`pnpm format` / `pnpm format:check`).
- **Vitest** em cada pacote (`vitest run`), testes colocados junto ao código (`*.test.ts[x]`).

## Consequências

- Lint é mais lento por ser type-aware, mas pega `any` inseguro e promessas soltas.
- Cada pacote roda `eslint .` herdando a config da raiz.
