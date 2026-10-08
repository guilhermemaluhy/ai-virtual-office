# 0010 — Motor dos agentes: regras decidem, IA conversa

- **Status:** Aceito
- **Data:** 2026-10-08

## Contexto

Os 15 agentes precisam trabalhar sozinhos (abrir tarefas, propor ações), respeitar alçadas (preço sempre com o CEO) e conversar com o CEO. A operação tem ~100 anúncios; erros custam dinheiro; o custo de IA precisa ser previsível.

## Decisão

- **Análise determinística** (`packages/agents/src/engine/analyzers.ts`): cada cargo tem regras explícitas e testadas sobre os dados da loja — ruptura e cobertura de estoque (Comprador), margem e conversão (Especialista), qualidade de cadastro (Cadastro), campeões de venda (Ads), margem alta (Afiliados), calendário promocional brasileiro (Campanhas), rotina (Atendimento). Limites (`RULES`) num só lugar; no máximo 3 propostas por tipo por ciclo.
- **Catálogo de ações** (`packages/tools`): cada ação tem risco, cargos que podem propor e `ceoOnly`. `routeAction` decide executar (dentro da autonomia do agente) ou pedir aprovação. Preço é `ceoOnly` — nenhuma configuração muda isso. Padrão de autonomia: `read` (tudo que altera a conta vai para o CEO).
- **Ciclo** (`runCycle`): transacional; deduplica por `key` (tarefas/pedidos abertos ou recusados nos últimos 7 dias não são repetidos); registra tudo no `audit_log`; recalcula o estado de cada agente no escritório. Roda no `apps/worker` a cada `AGENT_CYCLE_MS` (10 min), no seed e via `POST /cycle/run`.
- **Execução**: aprovar um pedido executa a ação na mesma transação (`applyAction`). Preço e compra alteram a loja local (simulação); as demais viram tarefa concluída até as integrações reais (fases 6–7).
- **IA (Claude)** só no **chat** com o CEO: `@anthropic-ai/sdk`, modelo `claude-opus-5-5` (configurável em `AI_MODEL`), esforço `low` por padrão (`AI_EFFORT`), _fallbacks_ de recusa no servidor ativados (`fallbacks: "default"`). O prompt traz papel, regras (não executa nada pelo chat; preço precisa do CEO; responder só com os dados fornecidos) e os dados atuais do agente.
- **Sem `ANTHROPIC_API_KEY`** o sistema funciona em **modo offline**: respostas montadas por regras (`offlineReply`), indicadas na interface. A chave nunca vai para o navegador; a demonstração pública é sempre offline.
- Atualização da tela continua por polling (5 s); eventos em tempo real ficam para quando houver mais de um processo emitindo mudanças em alta frequência.

## Consequências

- Decisões que mexem em dinheiro são reproduzíveis e testáveis; a IA não inventa ações.
- Custo de IA proporcional só ao uso do chat.
- Regras novas = função nova + teste; quando os dados reais chegarem (fase 6), as mesmas regras passam a olhar a conta de verdade.
- `POST /cycle/run` e o chat não têm autenticação ainda (fase 8); a API deve ficar restrita à rede local até lá.
