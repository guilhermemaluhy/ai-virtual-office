# FUNCIONÁRIOS — os 6 funcionários de IA da loja

> Versão v4 (2026-11-15). Definições executáveis em `packages/agents/src/employees.ts`; a tabela `employees` recebe uma cópia quando o funcionário é contratado e o dono pode ajustar prompt, agenda, orçamento e autonomia no banco, sem deploy.

Cada funcionário tem nome, cargo, avatar, objetivo, prompt de sistema, modelo, ferramentas permitidas, nível de autonomia (regra 4 do `CLAUDE.md`), agenda de trabalho, limite diário de custo e memória. Só o Gestor dispara os outros; o dono pode chamar qualquer um direto.

| Cargo (`role`)                            | Nome    | Modelo              | O que faz                                                                                                                                                                                                                                                                           | Toca na loja?                       | Autonomia máxima | Entra na fase |
| ----------------------------------------- | ------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------- | ------------- |
| Analista de Estoque (`analista_estoque`)  | Helena  | `claude-haiku-5-5`  | Lê vendas e estoque no Bling por canal. Sugere a compra do estoque comum para 15 dias e a do Full para 45 dias, separada por marketplace, agrupada por fornecedor (Emdisa). Aponta candidatos a Full (12+ vendas em 30 dias no estoque comum), produtos parados e risco de ruptura. | Não, só lê                          | simulação        | 4             |
| Gestor (`gestor`)                         | Ricardo | `claude-sonnet-5-5` | Reunião diária com a equipe, distribui tarefas, revisa o trabalho e manda um relatório diário ao dono, em horários configuráveis.                                                                                                                                                   | Não                                 | simulação        | 6             |
| Catálogo e Anúncios (`catalogo_anuncios`) | Marina  | `claude-haiku-5-5`  | Confere se todo produto ativo está anunciado no Mercado Livre e na Shopee, aponta anúncios com problema (foto, título, ficha técnica) e propõe correções.                                                                                                                           | Sim, com aprovação                  | aprovação        | 10            |
| Preço e Margem (`preco_margem`)           | Daniel  | `claude-sonnet-5-5` | Calcula a margem real por anúncio (taxas e frete de cada canal), sugere preço e entrada em promoções dentro da faixa de margem do dono.                                                                                                                                             | Sim: simulação → aprovação → faixa  | autônomo         | 8             |
| SAC (`sac`)                               | Júlia   | `claude-sonnet-5-5` | Escreve rascunhos de resposta a perguntas, reclamações e devoluções.                                                                                                                                                                                                                | Sim, sempre com aprovação no início | autônomo         | 9             |
| Analista de Mercado (`analista_mercado`)  | Pedro   | `claude-haiku-5-5`  | Acompanha preço, reputação e frete dos concorrentes nos produtos principais e avisa mudanças relevantes.                                                                                                                                                                            | Não                                 | simulação        | 10            |

Os nomes são personas para o escritório 3D; o dono pode trocar. Um funcionário de **Criativo** (imagens de anúncio) fica de fora: o Claude não gera imagens, e esse cargo exigiria outra ferramenta, com custo à parte.

## Regras comuns

- **Autonomia** (`employees.autonomy`): nasce em `simulacao`. Sobe um nível por vez (`aprovacao`, depois `autonomo`), só com liberação do dono e nunca acima do máximo do cargo (`canPromote` em `@aivo/agents`). Cargos que só leem nunca saem de `simulacao`.
- **Agenda** (`employees.schedule`): lista de expressões cron no horário de Brasília. Propostas iniciais: Estoque 8h e 17h; Gestor 8h30 de segunda a sábado; Preço 7h; SAC a cada 30 min das 8h às 22h; Catálogo e Mercado de manhã em dias úteis.
- **Orçamento** (`employees.daily_budget_micro_usd`): limite diário de custo de IA; `ai_usage` registra cada chamada e `employee_cost_today_micro_usd()` soma o dia. Ao estourar, o funcionário para até o dia seguinte e o dono é avisado.
- **Ferramentas** (`employees.allowed_tools`): menor privilégio; cada cargo só vê as ferramentas da sua função. Toda escrita na loja passa por `approvals` com antes/depois e pode ser desfeita.
- **Memória** (`employee_memory`): fatos duráveis por funcionário (ex.: "fornecedor X entrega em 10 dias"). `pgvector` entra quando a busca por similaridade for necessária.
- **Estados no escritório** (`employees.state`): `working` só com tarefa real em execução; botão de parada deixa todos `offline`.

## Antes de contratar

Antes de cada funcionário entrar, o Claude Code pergunta ao dono as regras de negócio dele (piso de margem, tom de voz do SAC, quais produtos acompanhar, fornecedores e prazos) e grava em [`docs/REGRAS_LOJA.md`](REGRAS_LOJA.md).
