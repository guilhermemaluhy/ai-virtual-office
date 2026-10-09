# Novera Virtual Office 3D

Escritório virtual tridimensional que serve de ambiente de trabalho para um agente de IA.
Projeto independente, construído do zero em etapas.

**Etapa atual: 1 — fundação** (projeto, cena base, câmera navegável, interface mínima).

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

A câmera é limitada ao interior da sala (não atravessa paredes, piso nem teto) e a distâncias
entre 1,2 m e 9 m do ponto observado.

## Estrutura

```
src/
  config/        constantes da aplicação e dimensões do escritório
  lib/           utilitários sem dependência de React (detecção de WebGL)
  scene/
    OfficeCanvas.tsx     ponto de entrada da cena 3D
    camera/              presets, limites, atalhos de teclado e CameraRig
    lighting/            luzes
    architecture/        piso, paredes, teto (móveis virão aqui)
  ui/            barra superior, controles de câmera, carregamento, erros
  styles/        CSS global
  test/          setup do Vitest
```

Regras de organização:

- A cena só reflete estado; nenhuma regra de negócio vive dentro do `Canvas`.
- A interface fala com a câmera por `CameraController`, nunca pela biblioteca de controles.
- Lógica testável (presets, limites, mapeamento de teclas) fica em arquivos `.ts` puros, com testes ao lado.

## Roteiro de etapas

1. ✅ Fundação: projeto, cena base, câmera, interface mínima, carregamento e erros
2. Arquitetura e materiais: piso/paredes PBR, janelas com vista externa, luz natural e artificial
3. Mobiliário procedural: mesa, cadeira, computador, armários, plantas e decoração
4. Agente: personagem humanoide, animações de repouso, estados visuais, seleção por clique
5. Interface do agente: painel lateral, janela de conversa, máquina de estados local
6. Serviço de IA via backend seguro (sem chaves no navegador)
7. Desempenho, adaptação a telas menores e preparação para publicação
