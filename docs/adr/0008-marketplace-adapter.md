# 0008 — `MarketplaceAdapter` e loja simulada

- **Status:** Aceito
- **Data:** 2026-10-08

## Contexto

O produto opera Mercado Livre e Shopee, mas precisamos desenvolver, testar e demonstrar sem contas reais, e as integrações reais só chegam nas fases 6–7.

## Decisão

- Novo pacote `packages/marketplace` com a interface `MarketplaceAdapter` (leitura: anúncios e pedidos). Ações de escrita entram junto com as integrações reais, sempre atrás de aprovações.
- `generateSimulatedStore()` gera uma loja **determinística** (PRNG com semente): ~100 produtos com **estoque único** compartilhado, anunciados em ML e/ou Shopee, 30 dias de pedidos coerentes com vendas e visitas, alguns produtos sem estoque e anúncios incompletos para os agentes terem o que fazer.
- `SimulatedMarketplaceAdapter` expõe essa loja pela mesma interface que os adaptadores reais terão.
- `pnpm db:seed` grava a loja simulada + organograma no banco (apaga tudo antes — só para dev/demo).

## Consequências

- Mesma semente → mesmos dados, o que torna testes e prints reproduzíveis.
- Os adaptadores `mercadolivre` e `shopee` implementarão a mesma interface; o resto do sistema não muda.
