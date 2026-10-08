# 0001 — Monorepo com pnpm workspaces + Turborepo

- **Status:** Aceito
- **Data:** 2026-10-08

## Contexto

O produto tem frontend, API, worker e várias bibliotecas compartilhadas (IA, agentes, comportamento, ferramentas, banco, UI). Precisamos versionar tudo junto, compartilhar tipos sem publicar pacotes e ter builds incrementais.

## Decisão

- **pnpm workspaces** (`apps/*`, `packages/*`), dependências internas com `workspace:*`. Versão do pnpm fixada em `packageManager`.
- **Turborepo** orquestra `build`, `lint`, `typecheck`, `test` e `dev`, com `dependsOn: ["^build"]` para respeitar o grafo e cache local de saídas (`dist/`, `.next/`).
- Escopo de pacotes: `@aivo/*`.

## Consequências

- Um único `pnpm install` e um único lockfile.
- Pacotes internos são consumidos a partir de `dist/` compilado; é preciso `pnpm build` (ou `pnpm dev`) antes de rodar apps isolados.
- Builds de scripts nativos são permitidos explicitamente (`onlyBuiltDependencies` em `pnpm-workspace.yaml`).
