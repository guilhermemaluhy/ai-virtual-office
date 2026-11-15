# SPEC — Escritório IA da Loja

> **Status:** v4 (2026-11-15). Substitui a v3 (15 agentes genéricos, loja simulada). A v4 serve uma empresa só, com dados reais do Bling, Mercado Livre e Shopee, e cresce fase a fase a partir de um funcionário só de leitura.

## 1. Visão

Um **escritório 3D no navegador** onde **6 funcionários de IA** operam de verdade a loja do dono no **Mercado Livre** e na **Shopee**, com dados do **Bling** (ERP). Eles leem dados, analisam, propõem e, dentro de limites aprovados, agem. Entre tarefas, vivem como pessoas num escritório (rotinas visuais, custo zero de IA).

O dono acompanha pelo escritório 3D (ver [SPEC_3D.md](SPEC_3D.md)) e por uma **tela 2D** sempre disponível (relatórios, aprovações, custos, botão de parada), inclusive no celular.

## 2. Usuário

- **Dono** — humano, leigo em programação, topo da hierarquia. Aprova ações, recebe relatórios e define as regras da loja ([REGRAS_LOJA.md](REGRAS_LOJA.md)).
- Uma empresa, um usuário. A coluna `organization_id` fica em todas as tabelas para não fechar a porta a uma segunda empresa.

## 3. Os funcionários

Seis funcionários, um por cargo, contratados fase a fase (detalhes em [FUNCIONARIOS.md](FUNCIONARIOS.md)): Analista de Estoque (Fase 4), Gestor (6), Preço e Margem (8), SAC (9), Catálogo e Anúncios (10), Analista de Mercado (10). Só o Gestor dispara os outros; o dono pode chamar qualquer um direto.

## 4. Regras

As 13 regras inegociáveis estão no [`CLAUDE.md`](../CLAUDE.md). As que moldam o produto:

- Toda escrita na loja sobe **simulação → aprovação → autônomo dentro de faixas**, um nível por vez, só com liberação do dono.
- Toda ação grava **antes e depois** e pode ser **desfeita com um clique**.
- **Botão de parada geral** pausa todos os funcionários na hora.
- Preço nunca abaixo do **piso de margem** por produto.
- Custo de IA registrado por funcionário e tarefa, com limite diário.

## 5. Arquitetura

| Parte         | Onde roda           | O que faz                                                                                                                                                          |
| ------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web`    | Netlify             | Login do dono, tela 2D e escritório 3D. Fala com o Supabase direto (chave publicável + RLS) e recebe Realtime                                                      |
| `apps/api`    | VPS Ferenz (Docker) | Fastify: saúde/estado, OAuth do Bling/ML/Shopee, ações na loja (sempre via aprovação)                                                                              |
| `apps/worker` | VPS Ferenz (Docker) | Agenda e fila (`pg-boss` no Postgres); roda os funcionários; honra o botão de parada a cada ciclo                                                                  |
| Supabase      | São Paulo           | Postgres + Auth + Realtime; projeto `escritorio-ia`                                                                                                                |
| Caddy         | VPS                 | HTTPS automático; `/api/*` → API; `/` → página "olá"                                                                                                               |
| `packages/*`  | —                   | `shared` (vocabulário), `db` (migrations SQL + espelho Drizzle + PGlite para testes), `agents` (os 6 funcionários), `ai` (`AIProvider`), `tools`, `behavior`, `ui` |

## 6. Modelo de dados (Fase 2)

Fonte da verdade: `supabase/migrations/`. Todas as tabelas têm `organization_id` e RLS que libera só o dono.

- `organizations` — a empresa (uma linha).
- `owners` — quem pode entrar; o primeiro usuário do Auth vira dono (trigger).
- `office_settings` — botão de parada (`paused`, quando, por quem, motivo). Função `set_office_paused()` (só o dono) e trigger que registra em `audit_log`.
- `employees` — cargo, nome, modelo, prompt, ferramentas permitidas, autonomia, agenda (cron), orçamento diário, estado no escritório.
- `tasks` — tarefas dos funcionários (fila, execução, resultado, erro).
- `approvals` — pedidos de aprovação: ação, risco, payload, antes/depois, decisão, edição do dono, desfazer.
- `reports` — relatórios em markdown para o dono.
- `employee_memory` — memória de longo prazo por funcionário.
- `ai_usage` — modelo, tokens e custo (micro-dólares) por funcionário e tarefa; `employee_cost_today_micro_usd()`.
- `audit_log` — trilha de auditoria (ator, ação, entidade, antes/depois).

## 7. Fases

Até a Fase 5 o dono já tem um funcionário de verdade trabalhando e aparecendo no escritório. Nenhum funcionário mexe na loja antes da Fase 8. Cada fase termina com testes passando, CI verde, "Estado atual" do `CLAUDE.md` atualizado e commit.

| #   | Fase                                         | Entregáveis                                                                                                                                                                       | O dono confere                                                                             | Status                   |
| --- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------ |
| 1   | Servidor e projeto                           | Repositório no GitHub, VPS Ferenz configurada e protegida (firewall, acesso por chave, atualizações automáticas), Docker + Caddy, projeto Supabase ligado, página "olá" publicada | Abre o endereço e vê a página com cadeado (HTTPS)                                          | ⏳ parcial (falta a VPS) |
| 2   | Banco e núcleo                               | Tabelas de funcionários, tarefas, logs, aprovações, relatórios, memória e `ai_usage`; login do dono; botão de parada geral                                                        | Entra com login e senha e vê a lista (vazia) de funcionários                               | ✅                       |
| 3   | Conexão com o Bling (leitura)                | OAuth do Bling, leitura de produtos, estoque e pedidos por canal, sincronização periódica                                                                                         | Uma tela mostra as vendas dos últimos 30 dias batendo com o Bling                          | ⏳                       |
| 4   | Funcionário 1: Analista de Estoque           | Agente com Haiku 5.5 rodando 2 vezes por dia: sugestão de compra (15 dias), Full (45 dias por marketplace), candidatos a Full, ruptura e parados                                  | Recebe o primeiro relatório e confere com a própria planilha                               | ⏳                       |
| 5   | Escritório 3D, primeira sala                 | Recepção, copa e a estação do Analista no padrão visual da v3; status real ao vivo; monitor com dados de estoque; tela 2D                                                         | Vê o Analista sentar e trabalhar quando a tarefa roda, e tomar café quando não há trabalho | ⏳                       |
| 6   | Gestor                                       | Reunião diária, distribuição de tarefas, relatório diário ao dono                                                                                                                 | Recebe o relatório do dia                                                                  | ⏳                       |
| 7   | Conexão com Mercado Livre e Shopee (leitura) | OAuth das duas lojas; leitura de anúncios, preços, taxas, perguntas e métricas                                                                                                    | Tela compara os dados com o painel de cada marketplace                                     | ⏳                       |
| 8   | Preço e Margem                               | Margem real por anúncio; sugestões em simulação; depois aprovação com antes e depois e botão desfazer                                                                             | Aprova uma mudança de preço e desfaz em seguida                                            | ⏳                       |
| 9   | SAC                                          | Rascunhos de resposta para aprovação, no tom definido pelo dono                                                                                                                   | Aprova uma resposta e ela aparece no marketplace                                           | ⏳                       |
| 10  | Catálogo e Analista de Mercado               | Conferir produtos nos dois canais, problemas de anúncio, acompanhamento de concorrentes                                                                                           | Recebe a lista do que falta anunciar em cada canal                                         | ⏳                       |
| 11  | Escritório completo e vida                   | Todas as estações, sala de reunião, rotinas 24h, qualidade adaptativa                                                                                                             | Passa o gate visual da SPEC_3D                                                             | ⏳                       |
| 12  | Autonomia e polimento                        | Faixas de autonomia por funcionário, alertas de custo, backup testado, TikTok Shop                                                                                                | Libera o primeiro funcionário para agir sozinho dentro da faixa                            | ⏳                       |

Modelo de prompt para cada fase: "Leia CLAUDE.md, docs/FUNCIONARIOS.md e docs/SPEC_3D.md. Execute SOMENTE a FASE N. Ao terminar: rode todos os testes, corrija falhas, atualize 'Estado atual' no CLAUDE.md em linguagem simples e faça commit. Não avance para a próxima fase."

## 8. Decisões em aberto

1. Domínio do servidor (para o certificado HTTPS do Caddy) e nome do site no Netlify.
2. Regras de negócio de cada funcionário — perguntadas antes de cada contratação ([REGRAS_LOJA.md](REGRAS_LOJA.md)).
3. Orçamento mensal de IA: o gasto real só se conhece depois de 1 mês com o primeiro funcionário (Fase 4).

## 9. Custos mensais estimados

VPS Ferenz R$ 155–285 (FNVL04 4 GB no início; FNVL06 8 GB com os 6) · Supabase R$ 0–135 · Claude API com 6 funcionários R$ 250–700 · Netlify, GitHub e apps do ML/Shopee/Bling R$ 0. Valores aproximados; câmbio e IOF variam.
