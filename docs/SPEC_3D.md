# SPEC 3D — o escritório virtual

> **Status:** v4 (2026-11-15). Complementa o [SPEC.md](SPEC.md). A base visual da v3 (realismo low-poly, iluminação, personagens, rotinas, performance, gate visual) continua valendo; o código da cena v3 está no histórico (commit `62a6c16`) como referência para a Fase 5.

## 1. Objetivo

Mostrar, de forma visual e intuitiva, **o que cada funcionário está fazendo agora**. O dono deve entender a situação da loja em poucos segundos só olhando o escritório — sem ler tabelas.

## 2. Estilo

- **Low-poly, isométrico, cores suaves** (estilo "escritório de jogo de simulação"), leve e agradável.
- Cada estação tem a cor e o ícone do cargo: Estoque (prateleira/caixa), Catálogo (câmera), Preço (etiqueta), SAC (headset), Mercado (binóculo), Gestor (prancheta).
- Avatares estilizados simples (corpo + cabeça + acessório), sem tentar parecer humanos reais.
- Funciona em notebook comum e celular; tema claro primeiro.

## 3. Layout do escritório

```
┌───────────────────────────────────────────────────────────────┐
│  Recepção                     │  Sala do Gestor               │
│  (quadro: resumo do dia,      │  (monitor: relatório diário,  │
│   botão de parada)            │   reunião)                    │
├───────────────────────────────┴───────────────────────────────┤
│  Área aberta — 5 estações                                     │
│  [Estoque] [Catálogo] [Preço] [SAC] [Mercado]                 │
├───────────────────────────────┬───────────────────────────────┤
│  Sala de reunião (mesa redonda)│  Copa (café, sofá)           │
└───────────────────────────────┴───────────────────────────────┘
```

- Sem financeiro, marketing ou sala de servidores separados.
- **Crescimento por fase:** o escritório nasce com 1 estação ocupada (Analista de Estoque) e as demais vazias e apagadas. Cada funcionário novo "é contratado": a estação acende e o avatar aparece.
- **Monitores com dados reais da loja:** Estoque mostra itens em risco de ruptura; Preço mostra margem média; SAC mostra perguntas pendentes; Gestor mostra o resumo do dia.

## 4. Estados dos funcionários

| Estado (`employees.state`) | Como aparece                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `working`                  | Sentado digitando; balão com a tarefa atual. **Só existe com tarefa real rodando.** |
| `idle`                     | Rotina de vida: café na copa, alongamento, conversa — custo zero de IA              |
| `meeting`                  | Caminha até a sala de reunião e senta na mesa redonda                               |
| `awaiting_approval`        | **Anel laranja** no avatar; o pedido aparece na recepção                            |
| `alert`                    | Mesa pisca em vermelho suave (ex.: ruptura de estoque)                              |
| `offline`                  | Cadeira vazia, monitor apagado (também quando o botão de parada está acionado)      |

Transições suaves (caminhada, fade); nada pisca de forma agressiva.

## 5. Interação

- **Câmera**: visão isométrica fixa com zoom e giro limitados; duplo clique foca uma área.
- **Clique no funcionário**: painel lateral com tarefa atual, últimas ações, pendências e chat.
- **Aprovações no 3D**: clicar em quem tem o anel laranja abre o pedido com **antes e depois** e os botões **Aprovar, Rejeitar e Editar**.
- Hover mostra nome, cargo e estado.

## 6. Técnica

- React Three Fiber + drei dentro do `apps/web` (Next.js), primitivas low-poly ou glTF leves.
- **Eventos chegam pelo Supabase Realtime** (tabelas `employees`, `tasks`, `approvals`, `reports`, `office_settings`), não Socket.IO. A cena só reflete o estado, não decide nada.
- Meta: 60 fps em notebook comum, carregamento inicial < 3 s, fallback 2D se WebGL indisponível.
- **Tela 2D sempre disponível** com as mesmas informações (relatórios, aprovações, custos, botão de parada), para o dono usar pelo celular. Na Fase 2 é a tela principal.

## 7. Acompanhamento visual

A cada entrega com mudança visual, prints (e vídeos curtos quando houver animação) são gerados com Playwright e enviados ao dono. O gate visual da v3 (realismo e rotinas 24h) vale para a Fase 11.
