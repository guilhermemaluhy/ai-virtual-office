# Novera Virtual Office 3D

Escritório virtual tridimensional que serve de ambiente de trabalho para um agente de IA.
Projeto independente, construído do zero em etapas.

**Etapa atual: 3 — personagem do agente** (humanoide procedural sentado na estação, animações sutis, seis estados visuais, seleção por clique, etiqueta com nome/função/status).

## Stack

| Tecnologia               | Versão | Papel                           |
| ------------------------ | ------ | ------------------------------- |
| Node.js                  | 22 LTS | ambiente de desenvolvimento     |
| TypeScript               | 6.0    | tipagem estrita                 |
| Vite                     | 8      | dev server e build              |
| React                    | 19     | interface                       |
| Three.js                 | 0.186  | renderização 3D                 |
| @react-three/fiber       | 9      | Three.js declarativo em React   |
| @react-three/drei        | 10     | utilitários (câmera, progresso) |
| lucide-react             | 1.x    | ícones                          |
| Vitest + Testing Library | 5 / 16 | testes (jsdom, sem WebGL)       |

## Como rodar

```bash
nvm use            # Node 22 (.nvmrc)
npm install
npm run dev        # http://localhost:5173
```

Outros comandos:

```bash
npm run build      # typecheck + build de produção em dist/
npm run preview    # serve o build em http://localhost:4173
npm run typecheck  # tsc --noEmit
npm test           # vitest (uma execução)
npm run test:watch # vitest em modo interativo
```

Não há variáveis de ambiente nesta etapa, por isso ainda não existe `.env.example`.
Chaves de IA nunca irão para o frontend: a integração com modelos será feita por um backend em etapa futura.

## Navegação

| Ação                   | Mouse                     | Teclado          |
| ---------------------- | ------------------------- | ---------------- |
| Girar a câmera         | arrastar (botão esquerdo) | `Q` / `E`        |
| Deslocar               | arrastar (botão direito)  | `A` / `D` ou ← → |
| Avançar / recuar       | —                         | `W` / `S` ou ↑ ↓ |
| Aproximar / afastar    | roda do mouse             | `+` / `-`        |
| Voltar à visão inicial | botão "Visão inicial"     | `R` ou `Home`    |

A câmera é limitada ao interior da sala (não atravessa paredes, piso nem teto), a distâncias
entre 1 m e 10 m do ponto observado, e não atravessa os móveis grandes (estante, aparador,
sofá, mesa de centro, gaveteiro). Mesa e cadeira são o centro de órbita e por isso não bloqueiam.

## O agente

- **Nova · Assistente de Operações** é o único agente desta versão. Está sentada na estação de
  trabalho, voltada para a mesa.
- **Estados visuais:** Ocioso, Trabalhando, Pensando, Executando tarefa, Concluído, Erro. Cada
  um muda a pose (inclinação do tronco, cabeça, mãos, digitação), a cor da esfera sobre a
  cabeça, a etiqueta 3D e o chip da barra superior.
- **Simulação, não inteligência.** O painel "Simulação local · sem IA" (canto inferior direito)
  troca o estado à mão ou em ciclo automático. Não existe tarefa nem modelo de IA por trás; a
  integração real virá por um backend em etapa futura. O store (`src/agent/agentStore.ts`) é
  o único ponto que a futura inteligência precisará alimentar.
- **Modelo substituível.** `scene/agent/Character.tsx` implementa `CharacterHandle.applyPose`;
  o rig (`characterRig.ts`) decide a pose a partir do estado e não sabe como o modelo é feito.
  Um glTF com esqueleto pode substituir o humanoide procedural implementando a mesma interface.

Depuração: abra `http://localhost:5173/?stats` para ver o FPS e registrar no console draw calls,
triângulos e memória de GPU (`[novera] render …`); `window.__novera` expõe `camera` e `controls`.

## Estrutura

```
src/
  config/        app.ts (render, flags) · office.ts (dimensões da sala e da fachada)
  lib/           math.ts (PRNG determinístico, rotação) · store.ts (store mínimo) · webgl.ts
  agent/         agentState.ts (estados, rótulos, perfil) · agentStore.ts · useDemoCycle.ts
  scene/
    OfficeCanvas.tsx     ponto de entrada da cena 3D (Canvas, fog, providers)
    layout.ts            posição, rotação e caixa de cada móvel (testado sem WebGL)
    camera/              presets, limites, teclado, colisores e CameraRig
    lighting/            Lighting (sol + céu + ambiente) · EnvironmentMap (reflexos procedurais)
    materials/           painters (Canvas 2D) · textures · materials · MaterialsProvider
    architecture/        Floor, Walls, Ceiling, CurtainWall (janelas), PendantLamp, Exterior
    furniture/           Desk, OfficeChair, Monitor, Keyboard, Mouse, DeskLamp, DeskItems,
                         Pedestal, Bookshelf, Sideboard, Sofa, CoffeeTable, Plant, WallArt,
                         WallClock, Door, Rug · Furniture.tsx compõe tudo a partir do layout
    agent/               types (Pose, CharacterHandle) · characterRig (pose por estado, testado)
                         Character (humanoide procedural) · AgentCharacter (liga store ↔ modelo)
                         AgentTag, StatusBadge, SelectionRing, Limb
    lib/                 InstancedGroup (vários objetos iguais em um draw call)
    debug/               RenderStats (?stats)
  ui/            barra superior (+ AgentChip), controles de câmera, StatusSimulator,
                 carregamento, erros
  styles/        CSS global
  test/          setup do Vitest
```

## Como o visual é construído

- **Sem arquivos externos.** Todas as texturas (piso de tábuas, reboco, tecido, veios de madeira,
  céu, tela do monitor, quadros) são pintadas em Canvas 2D na inicialização, com semente fixa:
  o resultado é idêntico a cada carregamento. Se o Canvas 2D não existir, os materiais caem em
  cores chapadas e a cena continua funcionando.
- **Materiais PBR compartilhados.** Uma instância por acabamento (`MaterialsProvider`), com mapa
  de cor, relevo e rugosidade no piso, e um mapa de ambiente gerado na própria cena para reflexos
  em vidro, metal e madeira.
- **Móveis procedurais.** Cada peça é um componente independente em `scene/furniture/`, pensado
  para ser trocado por um modelo glTF/GLB no futuro sem mexer no resto (basta manter a interface
  e a origem no piso, frente em +Z local).
- **Iluminação.** Um sol direcional entra pela fachada envidraçada e é a única luz com sombra
  (mapa 2048²). Céu/hemisfério e ambiente preenchem o restante; os pendentes têm spots reais e a
  luminária de mesa uma luz pontual, ambos sem sombra para manter o custo baixo.
- **Desempenho.** Renderização contínua desde a Etapa 3 (o personagem respira e digita), DPR
  limitado a 1,75, instâncias para livros, teclas, folhas, montantes e prédios. Referência
  medida com `?stats`: ~290 draw calls e ~96 mil triângulos na visão inicial.

Regras de organização:

- A cena só reflete estado; nenhuma regra de negócio vive dentro do `Canvas`.
- A interface fala com a câmera por `CameraController`, nunca pela biblioteca de controles.
- Lógica testável (presets, limites, mapeamento de teclas) fica em arquivos `.ts` puros, com testes ao lado.

## Roteiro de etapas

1. ✅ Fundação: projeto, cena base, câmera, interface mínima, carregamento e erros
2. ✅ Escritório 3D: arquitetura, janelas com vista externa, mobiliário procedural, luz natural e
   artificial, sombras, materiais e colisão da câmera com móveis
3. ✅ Agente: humanoide procedural, animações sutis, seis estados visuais (simulação local),
   seleção por clique, etiqueta e chip com nome/função/status
4. Interface do agente: painel lateral, janela de conversa com histórico e indicador de
   processamento (respostas simuladas)
5. Serviço de IA via backend seguro (sem chaves no navegador)
6. Desempenho, adaptação a telas menores e preparação para publicação
