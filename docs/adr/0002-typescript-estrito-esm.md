# 0002 — TypeScript estrito e ESM em todo o repositório

- **Status:** Aceito
- **Data:** 2026-10-08

## Contexto

Código de agentes e integrações com LLMs lida com muitos dados não confiáveis; erros de tipo em runtime são caros.

## Decisão

- `tsconfig.base.json` com `strict` mais `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noUnused*`, `verbatimModuleSyntax` e `isolatedModules`.
- Todos os pacotes são ESM (`"type": "module"`) com `module`/`moduleResolution: NodeNext` (imports relativos com extensão `.js`). O app Next.js usa `Bundler`.
- TypeScript fixado em `~5.9` enquanto o typescript-eslint não suporta 6.x/7.x.
- Variáveis de ambiente são validadas na borda com Zod (`parseEnv` em `@aivo/shared`).

## Consequências

- Mais anotações explícitas em troca de menos bugs.
- Cada pacote tem `tsconfig.json` (typecheck/lint, inclui testes) e `tsconfig.build.json` (emissão, exclui testes).
