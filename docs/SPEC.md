# SPEC — AI Virtual Office para operação de marketplace

> **Status:** rascunho para aprovação (v0.1, 2026-10-08). Nada além da Fase 1 deve ser construído antes de o dono do produto aprovar este documento.

## 1. Visão

Um **escritório virtual** onde um **squad de agentes de IA** opera a conta de marketplace do dono do negócio (começando pelo **Mercado Livre**). Cada agente cuida de uma área, trabalha sozinho dentro de limites definidos, participa de uma **reunião diária (daily)** conduzida por um agente **Gestor** e **pede aprovação** quando uma decisão passa do seu limite de autonomia.

O dono acompanha tudo por um **escritório 3D** (ver [SPEC_3D.md](SPEC_3D.md)) e por um **painel** com relatório diário e caixa de aprovações.

Referência de inspiração: WeStack (escritório virtual de agentes para contas de Mercado Livre).

## 2. Usuário

- **Dono/operador** do negócio que vende em marketplace. Não técnico. Quer menos trabalho repetitivo e mais controle sobre margem, estoque e reputação.
- Na primeira versão: **uma empresa, um usuário**. Multiusuário/multiempresa fica para depois.

## 3. O squad (6 agentes)

| Agente                  | Cuida de                                              | Faz sozinho (exemplos)                                         | Pede aprovação (exemplos)                                       |
| ----------------------- | ----------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| **Gestor**              | Coordena o squad, conduz a daily, consolida relatório | Abre pauta, cobra cada área, escreve o relatório diário        | Encaminha ao dono tudo que os outros não podem decidir          |
| **Catálogo & Anúncios** | Títulos, descrições, fotos, ficha técnica, qualidade  | Sugere melhorias, aponta anúncios incompletos                  | Alterar título/descrição publicados                             |
| **Preços & Margem**     | Preço, concorrência, margem após taxas e frete        | Monitora concorrentes, calcula margem real                     | Qualquer mudança de preço; tudo que reduz margem abaixo do piso |
| **Estoque & Reposição** | Estoque, ruptura, giro, sugestão de compra            | Alerta ruptura, calcula dias de cobertura                      | Pausar/reativar anúncio por estoque                             |
| **Atendimento**         | Perguntas pré-venda, mensagens pós-venda, reclamações | Rascunha respostas, responde perguntas frequentes já aprovadas | Respostas novas/sensíveis, reclamações e mediações              |
| **Performance & Ads**   | Vendas, conversão, visitas, Mercado Ads               | Aponta produtos com baixa performance nos últimos 30 dias      | Criar/alterar campanhas e orçamento de Ads                      |

### Limite de autonomia

- Cada ação tem um **nível de risco** (`leitura`, `baixo`, `médio`, `alto`).
- O dono configura, por agente, até qual nível ele age sozinho. Padrão inicial: **só leitura e sugestões** — tudo que altera a conta vai para aprovação.
- Toda ação executada fica num **log de auditoria** (quem, o quê, quando, antes/depois).

## 4. Rotina

1. **Ciclo de trabalho** (ex.: a cada hora): cada agente lê os dados da sua área, detecta problemas/oportunidades e gera **tarefas**, **sugestões** ou **pedidos de aprovação**.
2. **Daily** (horário configurável, ex.: 8h): o Gestor abre a pauta, cada agente reporta (o que fez, o que encontrou, o que precisa), o Gestor fecha com o **relatório do dia**.
3. **Aprovações**: o dono aprova/recusa no painel (e, em fase futura, por WhatsApp/e-mail). O agente executa e registra o resultado.
4. **Conversa**: o dono pode clicar num agente e perguntar algo ("por que o produto X caiu?").

## 5. Funcionalidades (MVP)

- Escritório 3D com os 6 agentes e seus estados em tempo real.
- Painel: relatório diário, caixa de aprovações, lista de tarefas por agente, log de auditoria.
- Chat com cada agente.
- Integração Mercado Livre: leitura (anúncios, pedidos, perguntas, estoque, visitas, reputação) e, depois, ações com aprovação.
- **Modo simulação**: loja fictícia com dados realistas para desenvolver e demonstrar sem conta real.

Fora do MVP: outros marketplaces, multiempresa, app mobile, notificações por WhatsApp.

## 6. Arquitetura (resumo)

- `apps/web` — Next.js: escritório 3D (React Three Fiber) + painel.
- `apps/api` — Fastify: REST + eventos em tempo real (WebSocket/SSE) para o escritório.
- `apps/worker` — ciclos dos agentes, daily agendada, sincronização com o marketplace (filas no Redis).
- `packages/agents` / `behavior` / `tools` / `ai` — lógica dos agentes, estados, ferramentas (cada ação do marketplace é uma ferramenta com nível de risco), cliente de LLM (Claude).
- `packages/db` — Postgres (ORM e migrations decididos na Fase 2).
- Integração com marketplace atrás de uma interface (`MarketplaceAdapter`) — `simulado` primeiro, `mercadolivre` depois, outros no futuro.

## 7. Fases

Cada fase termina com: testes passando, CI verde, prints do visual (quando houver mudança visual), "Estado atual" no CLAUDE.md atualizado e PR.

| Fase | Nome                                | Entrega principal                                                                                                                                                                       |
| ---- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Arquitetura e setup                 | ✅ Concluída                                                                                                                                                                            |
| 2    | Domínio, banco e loja simulada      | Modelo de dados (empresa, agentes, produtos, pedidos, perguntas, tarefas, aprovações, relatórios, auditoria), migrations, API básica, `MarketplaceAdapter` simulado com dados realistas |
| 3    | Escritório 3D (visual)              | Cena 3D com salas, mesas e os 6 avatares; estados animados vindos da API (ainda com dados simulados); prints                                                                            |
| 4    | Motor dos agentes + IA              | Ciclo de trabalho, ferramentas com nível de risco, limite de autonomia, fila de aprovações, chat com agente (Claude)                                                                    |
| 5    | Daily e painel                      | Daily agendada com animação na sala de reunião, relatório diário, caixa de aprovações, log de auditoria                                                                                 |
| 6    | Mercado Livre — leitura             | OAuth, sincronização de anúncios/pedidos/perguntas/estoque/visitas; agentes passam a analisar dados reais                                                                               |
| 7    | Mercado Livre — ações com aprovação | Responder perguntas, ajustar preço, pausar/reativar anúncio, editar anúncio — sempre via aprovação + auditoria                                                                          |
| 8    | Produção                            | Login, deploy, monitoramento, backups, notificações (e-mail/WhatsApp)                                                                                                                   |
| 9+   | Expansão                            | Shopee, Amazon, Magalu; multiusuário; novos agentes                                                                                                                                     |

## 8. Decisões em aberto (precisam do dono)

1. Quais marketplaces além do Mercado Livre, e em que ordem?
2. Tamanho da operação (nº de anúncios/pedidos por dia) — define a frequência dos ciclos e o custo de IA.
3. O que os agentes podem fazer **sem** aprovação desde o início?
4. Horário da daily e canal preferido para aprovações.
5. Orçamento mensal aceitável de IA (custo de tokens).
