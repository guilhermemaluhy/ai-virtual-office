import { AGENT_ROLES, MARKETPLACES } from '@aivo/shared';
import { describe, expect, it } from 'vitest';
import { deskFor, FLOOR_PLAN, inside, MEETING_TABLE, meetingSeats } from './layout';

const team = MARKETPLACES.flatMap((marketplace) =>
  AGENT_ROLES.filter((role) => role !== 'comprador').map((role) => ({ role, marketplace })),
);

describe('office layout', () => {
  it('gives every agent its own desk', () => {
    const spots = [...team.map((a) => deskFor(a.role, a.marketplace)), deskFor('comprador', null)];
    const keys = new Set(spots.map((s) => s.desk.join(',')));
    expect(keys.size).toBe(spots.length);
  });

  it('places each team inside its marketplace wing and the buyer in the stock room', () => {
    for (const { role, marketplace } of team) {
      const spot = deskFor(role, marketplace);
      expect(inside(FLOOR_PLAN.wings[marketplace], spot.desk)).toBe(true);
      expect(inside(FLOOR_PLAN.wings[marketplace], spot.seat)).toBe(true);
    }
    expect(inside(FLOOR_PLAN.stockRoom, deskFor('comprador', null).desk)).toBe(true);
  });

  it('mirrors the Shopee wing', () => {
    const ml = deskFor('ads', 'mercado_livre');
    const shopee = deskFor('ads', 'shopee');
    expect(shopee.desk[0]).toBe(-ml.desk[0]);
    expect(shopee.desk[2]).toBe(ml.desk[2]);
  });

  it('keeps desks apart', () => {
    const desks = team.map((a) => deskFor(a.role, a.marketplace).desk);
    for (const a of desks) {
      for (const b of desks) {
        if (a === b) continue;
        expect(Math.hypot(a[0] - b[0], a[2] - b[2])).toBeGreaterThan(2);
      }
    }
  });

  it('only the director gets a large desk', () => {
    expect(deskFor('diretor', 'shopee').large).toBe(true);
    expect(deskFor('cadastro', 'shopee').large).toBe(false);
  });

  it('rejects marketplace roles without a marketplace', () => {
    expect(() => deskFor('ads', null)).toThrow();
  });

  it('spreads meeting seats around the table', () => {
    const seats = meetingSeats(6);
    expect(seats).toHaveLength(6);
    for (const seat of seats) {
      const distance = Math.hypot(seat[0] - MEETING_TABLE[0], seat[2] - MEETING_TABLE[2]);
      expect(distance).toBeGreaterThan(2);
      expect(inside(FLOOR_PLAN.meetingRoom, seat)).toBe(true);
    }
    expect(meetingSeats(0)).toEqual([]);
  });
});
