# SPEC — AI Virtual Office para operação de marketplace

> **Status:** v0.3 (2026-10-08) — organograma (15 agentes), marketplaces e regra de preços definidos pelo CEO. Pontos ainda abertos na seção 9.

## 1. Visão

Uma **empresa virtual** onde **agentes de IA** operam as contas de marketplace do dono do negócio — **Mercado Livre e Shopee** desde o início. Os agentes estão organizados como uma empresa de verdade: **diretores**, **especialistas** e **analistas**, todos respondendo ao **CEO (o dono, humano)**. Cada agente trabalha sozinho dentro de limites definidos, participa de reuniões diárias e **pede aprovação** quando uma decisão passa do seu limite de autonomia.

O CEO acompanha tudo por um **escritório 3D** (ver [SPEC_3D.md](SPEC_3D.md)) e por um **painel** com relatórios diários e caixa de aprovações.

Referência de inspiração: WeStack (escritório virtual de agentes para contas de Mercado Livre).

## 2. Usuário

- **CEO** — dono do negócio, humano, topo da hierarquia. Não técnico. Aprova decisões de alto impacto e recebe os relatórios.
- Operação inicial: **~100 anúncios**, publicados no **Mercado Livre** e na **Shopee**.
- Na primeira versão: **uma empresa, um usuário (o CEO)**.

## 3. Organograma (15 agentes)

```
                         CEO (você, humano)
            ┌──────────────────┼───────────────────┐
   Diretor Mercado Livre   Comprador / Estoque   Diretor Shopee
            │              (compartilhado)            │
   Especialista Estratégico ML              Especialista Estratégico Shopee
            │                                        │
   ├─ Analista de Cadastro ML               ├─ Analista de Cadastro Shopee
   ├─ Analista de Ads ML                    ├─ Analista de Ads Shopee
   ├─ Analista de Afiliados ML              ├─ Analista de Afiliados Shopee
   ├─ Analista de Campanhas ML              ├─ Analista de Campanhas Shopee
   └─ Analista de Atendimento ML            └─ Analista de Atendimento Shopee
```

### Por marketplace (×2: Mercado Livre e Shopee)

| Agente                       | Responsabilidade                                                                                             | Faz sozinho (exemplos)                                                               | Pede aprovação (exemplos)                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **Diretor**                  | Responde pelo resultado do marketplace; conduz a daily do time; aprova o que está na sua alçada              | Cobra o time, consolida o relatório diário, aprova ações de risco baixo/médio        | Leva ao CEO tudo de risco alto (preço abaixo do piso, orçamento extra)                |
| **Especialista Estratégico** | Estratégia do canal: sortimento, **definição de preços**/margem, posicionamento, metas; orienta os analistas | Analisa margem real, concorrência e curva ABC; propõe preços e plano semanal         | **Toda mudança de preço (sempre aprovação do CEO)**, metas, entrada/saída de produtos |
| **Analista de Cadastro**     | Cadastrar anúncios **completos**: título, descrição, fotos, ficha técnica, variações, categoria, frete       | Monta rascunhos de anúncio, aponta anúncios incompletos                              | Publicar ou alterar anúncio                                                           |
| **Analista de Ads**          | Anúncios patrocinados (Mercado Ads / Shopee Ads): campanhas, lances, ACOS/ROAS                               | Monitora desempenho, sugere ajustes de lance e palavras-chave                        | Criar campanha, mudar orçamento ou lance                                              |
| **Analista de Afiliados**    | Programa de afiliados do marketplace: comissões, produtos ofertados, parceiros                               | Acompanha vendas por afiliados, sugere produtos/comissões                            | Alterar comissão, incluir/remover produtos                                            |
| **Analista de Campanhas**    | Campanhas de marketing gerais: datas promocionais, cupons, descontos, eventos do marketplace                 | Monta calendário promocional, simula impacto na margem                               | Aderir a campanha, criar cupom/desconto                                               |
| **Analista de Atendimento**  | Perguntas pré-venda, mensagens pós-venda, reclamações e mediações; reputação da conta                        | Rascunha respostas, responde perguntas frequentes já aprovadas, prioriza reclamações | Respostas novas ou sensíveis, reclamações, mediações e devoluções                     |

### Compartilhado

| Agente                              | Responsabilidade                                                                              | Faz sozinho                                                        | Pede aprovação                                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| **Comprador / Analista de Estoque** | Estoque único que abastece os dois marketplaces: ruptura, giro, cobertura, sugestão de compra | Alerta ruptura, calcula dias de cobertura, sugere pedido de compra | Pedido de compra; pausar/reativar anúncios por estoque |

### Limite de autonomia e alçadas

- Cada ação tem um **nível de risco**: `leitura`, `baixo`, `médio`, `alto`.
- A aprovação **sobe pela hierarquia**: analista → especialista/diretor (dentro da alçada do agente) → CEO.
- **Regra fixa — preços:** quem define preço é o Especialista Estratégico de cada marketplace, mas **toda mudança de preço precisa de aprovação do CEO**, sempre (risco `alto`, não delegável a diretores e não alterável pela configuração de alçadas).
- O CEO configura a alçada de cada cargo. **Padrão inicial: nada que altere a conta acontece sem aprovação do CEO**; agentes só leem, analisam e sugerem.
- Toda ação executada fica num **log de auditoria** (quem pediu, quem aprovou, o quê, quando, antes/depois).

## 4. Rotina

1. **Ciclo de trabalho** (ex.: a cada hora): cada agente lê os dados da sua área e gera **tarefas**, **sugestões** ou **pedidos de aprovação**.
2. **Daily por marketplace**: o Diretor abre a pauta, especialista e analistas reportam, o Diretor fecha com o relatório do canal. O Comprador participa das duas.
3. **Resumo do CEO**: relatório único consolidando os dois marketplaces + estoque, com as pendências de aprovação.
4. **Aprovações**: o CEO aprova/recusa no painel. O agente executa e registra o resultado.
5. **Conversa**: o CEO pode clicar em qualquer agente e perguntar algo.

## 5. Funcionalidades (MVP)

- Escritório 3D com os 15 agentes, a sala do CEO e estados em tempo real.
- Painel: resumo do CEO, relatórios por marketplace, caixa de aprovações, tarefas por agente, log de auditoria.
- Chat com cada agente.
- Integrações Mercado Livre e Shopee: leitura primeiro, depois ações com aprovação.
- **Modo simulação**: loja fictícia com ~100 produtos anunciados nos dois marketplaces, para desenvolver e demonstrar sem conta real.

Fora do MVP: outros marketplaces, multiusuário, app mobile, notificações por WhatsApp.

## 6. Arquitetura (resumo)

- `apps/web` — Next.js: escritório 3D (React Three Fiber) + painel.
- `apps/api` — Fastify: REST + eventos em tempo real (WebSocket/SSE) para o escritório.
- `apps/worker` — ciclos dos agentes, dailies agendadas, sincronização com os marketplaces (filas no Redis).
- `packages/agents` / `behavior` / `tools` / `ai` — organograma, lógica dos agentes, estados, ferramentas (cada ação é uma ferramenta com nível de risco), cliente de LLM (Claude).
- `packages/marketplace` — interface `MarketplaceAdapter` + adaptador **simulado**; `mercadolivre` e `shopee` reais nas fases 6–7.
- `packages/db` — Postgres com Drizzle ORM e migrations SQL versionadas.

## 7. Modelo de dados (Fase 2)

- `agents` — cargo, marketplace (ou compartilhado), a quem reporta, cor, alçada.
- `products` — SKU, custo, estoque (único para os dois canais).
- `listings` — anúncio de um produto num marketplace: preço, status, qualidade do cadastro, visitas e vendas.
- `orders` — pedidos por anúncio.
- `tasks` — tarefas dos agentes.
- `approvals` — pedidos de aprovação (ação, risco, dados, status, quem decidiu).
- `reports` — relatórios diários (por marketplace e do CEO).
- `audit_log` — trilha de auditoria.

## 8. Fases

Cada fase termina com: testes passando, CI verde, prints do visual (quando houver mudança visual), "Estado atual" no CLAUDE.md atualizado e PR.

| Fase | Nome                              | Entrega principal                                                                                                                            |
| ---- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Arquitetura e setup               | ✅ Concluída                                                                                                                                 |
| 2    | Domínio, banco e loja simulada    | Modelo de dados, migrations, organograma dos 15 agentes, adaptador simulado com ~100 produtos em ML + Shopee, API de leitura e de aprovações |
| 3    | Escritório 3D (visual)            | Cena 3D com alas ML e Shopee, sala do CEO, estoque e os 15 avatares; estados vindos da API; prints                                           |
| 4    | Motor dos agentes + IA            | Ciclo de trabalho, ferramentas com risco, alçadas, fila de aprovações, chat com agente (Claude)                                              |
| 5    | Dailies e painel                  | Dailies por marketplace, resumo do CEO, caixa de aprovações, log de auditoria                                                                |
| 6    | Integrações — leitura             | OAuth e sincronização de anúncios/pedidos/estoque/ads no Mercado Livre e na Shopee                                                           |
| 7    | Integrações — ações com aprovação | Publicar/editar anúncio, ajustar preço, campanhas, ads e afiliados — sempre via aprovação + auditoria                                        |
| 8    | Produção                          | Login, deploy, monitoramento, backups, notificações                                                                                          |
| 9+   | Expansão                          | Outros marketplaces, multiusuário, novos cargos                                                                                              |

## 9. Decisões tomadas

- Marketplaces iniciais: Mercado Livre e Shopee; ~100 anúncios.
- Organograma da seção 3, incluindo 1 Analista de Atendimento por marketplace.
- Preços: definidos pelo Especialista Estratégico, sempre com aprovação do CEO.
- Comprador/Estoque compartilhado entre os marketplaces (estoque físico único).

## 10. Decisões em aberto

1. Alçadas: o que cada cargo pode fazer **sem** o CEO depois que o sistema ganhar confiança?
2. Horário das dailies e canal preferido para aprovações.
3. Orçamento mensal aceitável de IA (custo de tokens).
