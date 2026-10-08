/** Rounds to whole reais ending in ,90 (marketplace convention). */
export const priceEnding90 = (cents: number) => Math.max(90, Math.round(cents / 100) * 100 - 10);

export const brl = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s/g, ' ');

/** Gross margin over price, before marketplace fees and shipping. */
export const marginPct = (priceCents: number, costCents: number) =>
  priceCents > 0 ? (priceCents - costCents) / priceCents : 0;
