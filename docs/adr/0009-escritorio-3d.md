# 0009 — Escritório 3D com React Three Fiber

- **Status:** Aceito
- **Data:** 2026-10-08

## Contexto

O CEO acompanha a operação pelo escritório 3D (SPEC_3D). Precisa ser leve, funcionar em notebook comum e celular, refletir o estado vindo da API e ser fácil de evoluir (dailies animadas, novos cargos).

## Decisão

- **React Three Fiber 9 + drei 10 + three** dentro do `apps/web` (Next.js), carregados só no cliente (`next/dynamic`, `ssr: false`).
- Cena montada com **primitivas low-poly** (caixas, cápsulas, cilindros) — sem modelos glTF por enquanto: zero assets para baixar, fácil de ajustar por código.
- **Câmera ortográfica isométrica** com `OrbitControls` limitados; o zoom se ajusta ao tamanho da tela (celular mostra metade do andar e permite arrastar).
- **Planta baixa como dados** (`lib/office/layout.ts`): posição de cada mesa derivada de cargo + marketplace; ala Shopee espelha a do Mercado Livre. Testada sem WebGL.
- Etiquetas (nomes, balões de tarefa, "! aprovação") em **HTML sobreposto** (`<Html>` do drei), nítidas e acessíveis. A cena só monta depois do canvas existir (contorno para o `<Html>` perder o conteúdo) e os cliques nas etiquetas param a propagação para não serem tratados como clique no vazio.
- A cena **só reflete** o estado da API (`/agents`, `/tasks`, `/approvals`, `/dashboard/summary`), atualizado por **polling a cada 5 s**. Eventos em tempo real (SSE/WebSocket) entram com o motor dos agentes (Fase 4).
- Sem WebGL → lista 2D dos agentes com o mesmo painel de detalhes.

## Consequências

- Visual simples, porém consistente; dá para trocar primitivas por modelos glTF depois sem mudar o layout.
- Polling é suficiente para 15 agentes; será substituído por eventos quando os agentes passarem a agir sozinhos.
- Prints são gerados com Playwright (Chromium headless com SwiftShader).
