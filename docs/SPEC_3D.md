# SPEC 3D — o escritório virtual

> **Status:** v0.2 (2026-10-08). Complementa o [SPEC.md](SPEC.md).

## 1. Objetivo

Mostrar, de forma visual e intuitiva, **o que cada agente está fazendo agora**. O CEO deve entender a situação da operação em poucos segundos só olhando o escritório — sem ler tabelas.

## 2. Estilo

- **Low-poly, isométrico, cores suaves** (estilo "escritório de jogo de simulação"), leve e agradável.
- **Cor por marketplace** (piso/carpete da ala, detalhes das mesas e uniformes): Mercado Livre — amarelo · Shopee — laranja. Compartilhado (estoque) — azul-acinzentado. CEO — roxo/dourado.
- **Cargo identificado por acessório e ícone**: Diretor (gravata, mesa maior), Especialista (quadro com gráficos), Cadastro (câmera/caixa de produto), Ads (megafone/gráfico de cliques), Afiliados (ícone de aperto de mão/link), Campanhas (calendário/etiqueta de desconto), Comprador (prancheta, prateleiras).
- Avatares estilizados simples (corpo + cabeça + acessório), sem tentar parecer humanos reais.
- Funciona em notebook comum e celular; tema claro primeiro.

## 3. Layout do escritório

```
┌─────────────────────────────────────────────────────────────┐
│                    Sala do CEO (você)                        │
│            mural de aprovações · resumo do dia               │
├──────────────────────┬─────────────────┬────────────────────┤
│  Ala MERCADO LIVRE   │  Sala de        │  Ala SHOPEE        │
│  (piso amarelo)      │  reunião        │  (piso laranja)    │
│  [Diretor]           │  (dailies)      │  [Diretor]         │
│  [Especialista]      ├─────────────────┤  [Especialista]    │
│  [Cadastro] [Ads]    │  Estoque /      │  [Cadastro] [Ads]  │
│  [Afiliados][Campanh]│  Comprador      │  [Afiliados][Camp] │
│                      │  (prateleiras)  │                    │
└──────────────────────┴─────────────────┴────────────────────┘
```

O CEO é humano: a sala dele mostra a cadeira do CEO (sem avatar de IA), o mural de aprovações pendentes e o resumo do dia.

## 4. Estados dos agentes

| Estado               | Como aparece                                                      |
| -------------------- | ----------------------------------------------------------------- |
| Trabalhando          | Sentado digitando; balão com a tarefa atual ("Revendo 12 preços") |
| Ocioso               | Recostado, caneca de café                                         |
| Em reunião           | Caminha até a sala de reunião e senta na mesa redonda             |
| Aguardando aprovação | Ícone "!" sobre a cabeça; card aparece no mural de aprovações     |
| Alerta               | Mesa pisca em vermelho suave (ex.: ruptura de estoque)            |
| Offline/pausado      | Cadeira vazia, monitor apagado                                    |

Transições suaves (caminhada, fade); nada pisca de forma agressiva.

## 5. Interação

- **Câmera**: visão isométrica fixa com zoom e giro limitados; duplo clique foca uma área.
- **Clique no agente**: abre painel lateral com tarefa atual, últimas ações, pendências e chat com o agente.
- **Clique no mural**: abre a caixa de aprovações.
- **Durante a daily**: legendas com a fala de cada agente; ao fim, o relatório abre no painel.
- Hover mostra nome, área e estado.

## 6. Técnica

- React Three Fiber + drei dentro do `apps/web` (Next.js), modelos simples (primitivas ou glTF leves).
- Estado vem da API em tempo real (WebSocket/SSE); a cena só reflete o estado, não decide nada.
- Meta: 60 fps em notebook comum, carregamento inicial < 3 s, fallback 2D se WebGL indisponível.
- Acessibilidade: todo o conteúdo do escritório também disponível no painel em texto.

## 7. Acompanhamento visual

A cada entrega com mudança visual, prints (e vídeos curtos quando houver animação) são gerados automaticamente com Playwright e enviados ao dono.
