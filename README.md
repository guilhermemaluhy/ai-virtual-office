# ai-virtual-office

Escritório virtual com agentes de IA — monorepo pnpm + Turborepo.

```bash
cp .env.example .env
docker compose up -d --wait
pnpm install
pnpm build && pnpm lint && pnpm test
pnpm dev
```

Veja [`CLAUDE.md`](CLAUDE.md) para comandos e convenções e [`docs/adr/`](docs/adr/README.md) para as decisões de arquitetura.
