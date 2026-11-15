# Escritório IA da Loja

Escritório 3D no navegador onde 6 funcionários de IA operam a loja no Mercado Livre e na Shopee, com dados do Bling. Monorepo pnpm + Turborepo.

```bash
cp .env.example .env     # DATABASE_URL e SUPABASE_SERVICE_ROLE_KEY só no servidor
pnpm install
pnpm build && pnpm lint && pnpm test
pnpm dev                 # web :3000 (login do dono), api :3001, worker
```

- Contexto e regras: [`CLAUDE.md`](CLAUDE.md)
- Produto e fases: [`docs/SPEC.md`](docs/SPEC.md) · Funcionários: [`docs/FUNCIONARIOS.md`](docs/FUNCIONARIOS.md) · Escritório 3D: [`docs/SPEC_3D.md`](docs/SPEC_3D.md)
- Servidor, Netlify e Supabase: [`docs/DEPLOY.md`](docs/DEPLOY.md) · Decisões: [`docs/adr/`](docs/adr/README.md)
