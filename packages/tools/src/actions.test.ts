import { describe, expect, it } from 'vitest';
import { ACTIONS, isActionId, routeAction } from './index.js';

describe('routeAction', () => {
  it('always sends price changes to the CEO, whatever the autonomy', () => {
    expect(
      routeAction(ACTIONS['listing.change_price'], { role: 'estrategista', autonomy: 'high' }),
    ).toEqual({
      kind: 'approval',
      approver: 'ceo',
    });
  });

  it('asks for approval above the agent autonomy and executes within it', () => {
    const action = ACTIONS['affiliates.add_products'];
    expect(routeAction(action, { role: 'afiliados', autonomy: 'read' }).kind).toBe('approval');
    expect(routeAction(action, { role: 'afiliados', autonomy: 'low' }).kind).toBe('execute');
  });

  it('rejects actions outside the role', () => {
    expect(() =>
      routeAction(ACTIONS['purchase.create_order'], { role: 'ads', autonomy: 'high' }),
    ).toThrow();
  });

  it('recognises action ids', () => {
    expect(isActionId('campaign.join')).toBe(true);
    expect(isActionId('nope')).toBe(false);
  });
});
