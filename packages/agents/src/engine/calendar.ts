import type { Marketplace } from '@aivo/shared';

export interface CampaignEvent {
  id: string;
  name: string;
  /** Month (1–12) and day the event happens. */
  month: number;
  day: number;
  marketplaces: readonly Marketplace[];
}

/** Recurring Brazilian e-commerce dates the campaign analysts plan for. */
export const CAMPAIGN_CALENDAR: readonly CampaignEvent[] = [
  {
    id: 'dia-do-consumidor',
    name: 'Dia do Consumidor',
    month: 3,
    day: 15,
    marketplaces: ['mercado_livre', 'shopee'],
  },
  {
    id: 'dia-das-maes',
    name: 'Dia das Mães',
    month: 5,
    day: 10,
    marketplaces: ['mercado_livre', 'shopee'],
  },
  { id: '9-9', name: '9.9', month: 9, day: 9, marketplaces: ['shopee'] },
  { id: '10-10', name: '10.10', month: 10, day: 10, marketplaces: ['shopee'] },
  { id: '11-11', name: '11.11', month: 11, day: 11, marketplaces: ['shopee', 'mercado_livre'] },
  {
    id: 'black-friday',
    name: 'Black Friday',
    month: 11,
    day: 27,
    marketplaces: ['mercado_livre', 'shopee'],
  },
  { id: '12-12', name: '12.12', month: 12, day: 12, marketplaces: ['shopee'] },
  { id: 'natal', name: 'Natal', month: 12, day: 20, marketplaces: ['mercado_livre', 'shopee'] },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Next occurrence of each event within `days`, soonest first. */
export function upcomingEvents(marketplace: Marketplace, now: Date, days: number) {
  return CAMPAIGN_CALENDAR.filter((e) => e.marketplaces.includes(marketplace))
    .map((event) => {
      let date = new Date(Date.UTC(now.getUTCFullYear(), event.month - 1, event.day));
      if (date.getTime() < now.getTime() - DAY_MS) {
        date = new Date(Date.UTC(now.getUTCFullYear() + 1, event.month - 1, event.day));
      }
      return { event, date, inDays: Math.ceil((date.getTime() - now.getTime()) / DAY_MS) };
    })
    .filter((e) => e.inDays >= 0 && e.inDays <= days)
    .sort((a, b) => a.inDays - b.inDays);
}
