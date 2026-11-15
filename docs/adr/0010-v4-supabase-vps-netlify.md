# 0010 — v4: Supabase, VPS Ferenz, Netlify e seis funcionários

- **Status:** Aceito
- **Data:** 2026-11-15
- **Substitui:** 0005 (Postgres + Redis locais), 0008 (loja simulada); ajusta 0007 (migrations) e 0009 (3D)

## Contexto

A v3 era um SaaS genérico com 15 agentes e uma loja simulada. O dono quer um escritório que opere a **sua** loja com dados reais (Bling, Mercado Livre, Shopee), começando por um funcionário só de leitura e crescendo fase a fase, com o menor número de peças possível e tudo pago em real.

## Decisão

- **Supabase** (Postgres + Auth + Realtime, região São Paulo) no lugar do Postgres próprio: login do dono sem código de autenticação, backup gerenciado, eventos ao vivo para o 3D. O web fala com o Supabase direto com a chave publicável; **RLS** libera só o dono (`is_owner()`); API e worker usam a service role na VPS.
- **Sem Redis.** A fila dos funcionários será `pg-boss` no próprio Postgres (Fase 4).
- **Migrations em SQL** em `supabase/migrations/` (fonte da verdade, convenção do Supabase CLI). `packages/db/src/schema.ts` vira um **espelho Drizzle** para consultas tipadas; um teste compara tabelas, colunas e enums do PGlite com o espelho e com `@aivo/shared`. O PGlite recebe um `auth` falso (`packages/db/sql/auth-stub.sql`) para rodar o mesmo SQL. RLS não é testada no PGlite (superusuário).
- **Primeiro usuário vira dono** (trigger em `auth.users`). Simples, sem tela de cadastro; o dono desliga novos cadastros no Supabase depois.
- **Botão de parada** como função `set_office_paused()` (`security definer`, só o dono) + trigger de auditoria; o worker lê `office_settings.paused` a cada ciclo.
- **Custo de IA em micro-dólares** (`bigint`), porque a API cobra em USD e frações de centavo importam; a tela converte para real.
- **VPS Ferenz** com Docker Compose (API + worker + Caddy) e **Netlify** para o web. Uma imagem Docker para API e worker.
- **Seis funcionários** definidos em `@aivo/agents` (`EMPLOYEES`), um por cargo, com autonomia máxima por cargo; a loja simulada (`@aivo/marketplace`) e o organograma de 15 foram removidos. O escritório 3D da v3 saiu do `apps/web` e fica no histórico (`62a6c16`) como referência visual para a Fase 5.

## Consequências

- Menos componentes para operar (sem Redis, sem Postgres próprio, sem sala de servidores).
- Dependência do Supabase para Auth e Realtime; o `organization_id` em todas as tabelas mantém a porta aberta para mais empresas.
- Desenvolvimento local usa o projeto Supabase de verdade (plano grátis); testes continuam sem rede (PGlite).
- O 3D será reconstruído na Fase 5 com 7 ambientes e crescimento por fase, reaproveitando o padrão visual da v3.
