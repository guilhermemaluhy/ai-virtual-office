import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Hud } from './Hud';

describe('Hud', () => {
  it('shows marketplace KPIs and pending approvals', () => {
    const html = renderToStaticMarkup(
      <Hud
        summary={{
          marketplaces: [
            {
              marketplace: 'mercado_livre',
              activeListings: 89,
              orders30d: 2529,
              revenue30dCents: 32312110,
            },
            {
              marketplace: 'shopee',
              activeListings: 84,
              orders30d: 1711,
              revenue30dCents: 20594290,
            },
          ],
          stock: { outOfStock: 2, lowStock: 7 },
          pendingApprovals: 5,
        }}
        onOpenApprovals={() => undefined}
      />,
    );
    expect(html).toContain('Mercado Livre');
    expect(html).toContain('Shopee');
    expect(html).toContain('2.529 pedidos');
    expect(html).toContain('5 pendentes');
    expect(html).toContain('2 sem estoque');
  });

  it('renders without data', () => {
    expect(
      renderToStaticMarkup(<Hud summary={null} onOpenApprovals={() => undefined} />),
    ).toContain('0 pendentes');
  });
});
