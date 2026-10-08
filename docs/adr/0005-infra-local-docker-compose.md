# 0005 — Infra local com Docker Compose (Postgres + Redis)

- **Status:** Aceito
- **Data:** 2026-10-08

## Decisão

- `docker-compose.yml` na raiz com `postgres:17-alpine` e `redis:7-alpine` (AOF ligado), volumes nomeados e healthchecks.
- Credenciais e portas vêm de `.env` com defaults (`aivo`/`aivo`, 5432, 6379). `.env.example` documenta todas as variáveis.
- Os apps rodam no host (`pnpm dev`); containerizar os apps fica para a fase de deploy.

## Consequências

- `docker compose up -d --wait` deixa o ambiente pronto; `docker compose down -v` zera os dados.
