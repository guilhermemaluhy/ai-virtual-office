# DEPLOY — servidor, painel e banco

> Fase 1 ainda parcial: a VPS Ferenz foi ativada (IP abaixo) mas ainda não foi configurada. Tudo que não depende dela já está pronto; este arquivo é o roteiro para terminar.

## O que já existe

| Peça                     | Estado                                                                           |
| ------------------------ | -------------------------------------------------------------------------------- |
| Repositório GitHub       | `guilhermemaluhy/ai-virtual-office`                                              |
| Supabase `escritorio-ia` | Projeto criado (São Paulo), migration da Fase 2 aplicada, RLS e Realtime ligados |
| Painel (`apps/web`)      | Pronto; `netlify.toml` na raiz. Falta ligar o repositório a um site no Netlify   |
| API + worker             | Prontos; `deploy/Dockerfile` e `deploy/docker-compose.yml` (API, worker, Caddy)  |
| VPS Ferenz               | **Pendente** (aguardando IP)                                                     |

## 1. Configurar a VPS (termina a Fase 1)

Roda do **seu computador** (o Claude Code na nuvem não tem saída SSH). A Ferenz entregou a VPS com usuário `root` e senha por e-mail; a senha deixa de ser usada depois do passo 2.

1. Aponte um domínio para `74.1.74.208` (registro A), por exemplo `escritorio.suaempresa.com.br`. Sem domínio o Caddy não emite HTTPS.
2. Gere uma chave SSH no seu computador, se ainda não tiver (`ssh-keygen -t ed25519`), e rode o preparo da máquina (uma vez, dentro da pasta do repositório; ele pede a senha de root):

   ```bash
   DEPLOY_PUBKEY="$(cat ~/.ssh/id_ed25519.pub)" ssh root@74.1.74.208 "DEPLOY_PUBKEY='$DEPLOY_PUBKEY' bash -s" < deploy/setup-vps.sh
   ```

   Ele cria o usuário `deploy` com a sua chave, desliga login por senha (só se a chave entrou), liga firewall (22/80/443), atualizações automáticas, fail2ban e instala Docker + Compose. Ao terminar, troque a senha de root (`ssh deploy@74.1.74.208 sudo passwd root`).

3. Entre como `deploy`, clone o repositório e preencha o `.env`:

   ```bash
   ssh deploy@74.1.74.208
   git clone https://github.com/guilhermemaluhy/ai-virtual-office /opt/escritorio-ia
   cd /opt/escritorio-ia/deploy && cp .env.example .env && nano .env
   ```

   `DOMAIN`, `ACME_EMAIL`, `DATABASE_URL` (Supabase → Project Settings → Database → Session pooler), `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API keys) e `WEB_ORIGIN` (endereço do painel no Netlify).

4. Suba tudo:

   ```bash
   docker compose up -d --build
   docker compose ps && docker compose logs -f api worker
   ```

5. Confira: `https://DOMAIN` mostra a página "olá" com cadeado; `https://DOMAIN/api/health` responde `{"status":"ok"}`; `https://DOMAIN/api/status` mostra `paused` e o número de funcionários.

Atualizar depois: `git pull && docker compose up -d --build`.

> O `Dockerfile` e o Compose foram escritos mas **ainda não foram construídos** (este ambiente não tem o daemon do Docker). Se o primeiro `docker compose up` falhar, o erro aparece no log e se corrige no próprio repositório.

## 2. Painel no Netlify

1. Netlify → Add new site → Import from Git → este repositório. O `netlify.toml` já define o comando de build (`pnpm turbo run build --filter=@aivo/web`), a pasta e o plugin do Next.js.
2. Site settings → Environment variables: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (valores no `.env.example`; são públicos por natureza, a RLS protege os dados).
3. Supabase → Authentication → URL Configuration: coloque o endereço do site em **Site URL** e em **Redirect URLs**.
4. Copie o endereço do site para `WEB_ORIGIN` no `.env` da VPS.

## 3. Login do dono (Supabase Auth)

O primeiro usuário criado vira o dono automaticamente. Duas formas:

- Pelo terminal, com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env` da raiz:

  ```bash
  pnpm build && pnpm owner:create -- seu@email.com 'uma-senha-forte' 'Guilherme'
  ```

- Ou no painel do Supabase → Authentication → Users → **Add user** → e-mail, senha e "Auto confirm user".

Depois, em Authentication → Sign In / Providers, desligue **Allow new users to sign up**: só o dono precisa de conta. (Mesmo que alguém crie uma conta, a RLS não deixa ver nada.) Em Authentication → Attack Protection, ligue **Leaked password protection**.

O Security Advisor do Supabase ainda avisa que `is_owner()` e `set_office_paused()` podem ser chamadas por usuários logados: é intencional, as duas conferem quem é o dono antes de fazer qualquer coisa.

## 4. Migrations

- Fonte da verdade: `supabase/migrations/`. Nova migration = novo arquivo `YYYYMMDDHHMMSS_assunto.sql`; nunca editar um já aplicado.
- Aplicar no projeto: `supabase link --project-ref libiqtkjccxguszftzdt && supabase db push`, ou pelo conector Supabase do Claude (`apply_migration` com o mesmo conteúdo).
- O CI aplica todas num Postgres 17 vazio (`pnpm db:migrate -- --stub-auth`) a cada push, e os testes rodam o mesmo SQL no PGlite.
