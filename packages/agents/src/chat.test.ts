import { EchoProvider, OfflineProvider } from '@aivo/ai';
import { agents, approvals, products } from '@aivo/db';
import { createTestDatabase, type TestDatabase } from '@aivo/db/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chatWithAgent, loadChatContext } from './chat.js';
import { buildSystemPrompt, offlineReply } from './chat-text.js';
import { ORG_CHART } from './org-chart.js';

describe('chat', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    await testDb.db.insert(agents).values(
      ORG_CHART.map(({ id, name, title, role, marketplace, reportsTo }) => ({
        id,
        name,
        title,
        role,
        marketplace,
        reportsTo,
      })),
    );
    await testDb.db
      .insert(products)
      .values({ sku: 'SKU-9', title: 'Fone', category: 'Eletrônicos', costCents: 4500, stock: 2 });
    await testDb.db.insert(approvals).values({
      requestedBy: 'comprador',
      action: 'purchase.create_order',
      summary: 'Comprar 30 un. de "Fone"',
      risk: 'high',
    });
  }, 30_000);

  afterAll(async () => {
    await testDb.close();
  });

  it('builds context from the agent data', async () => {
    const ctx = await loadChatContext(testDb.db, 'comprador');
    expect(ctx).toMatchObject({
      name: 'Paulo',
      managerName: null,
      pendingApprovals: ['Comprar 30 un. de "Fone"'],
    });
    expect(ctx?.facts.join('\n')).toContain('SKU-9');
    expect(await loadChatContext(testDb.db, 'nope')).toBeUndefined();
  });

  it('puts role, rules and data in the system prompt', async () => {
    const ctx = await loadChatContext(testDb.db, 'shopee-estrategista');
    if (!ctx) throw new Error('missing');
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain('Bruno');
    expect(prompt).toContain('preço sempre precisa da aprovação');
    expect(prompt).toContain('Marina (Diretora Shopee)');
  });

  it('answers offline without a model and with Claude when available', async () => {
    const offline = await chatWithAgent(testDb.db, new OfflineProvider(), 'comprador', [
      { role: 'user', content: 'Oi' },
    ]);
    expect(offline?.mode).toBe('offline');
    expect(offline?.reply).toContain('Paulo');

    const ai = await chatWithAgent(testDb.db, new EchoProvider(), 'comprador', [
      { role: 'user', content: 'Quanto de estoque?' },
    ]);
    expect(ai).toEqual({ reply: 'Quanto de estoque?', mode: 'ai' });
  });

  it('offline reply mentions pending decisions', () => {
    const reply = offlineReply({
      name: 'Ana',
      title: 'Analista',
      role: 'ads',
      marketplace: 'shopee',
      managerName: null,
      tasks: [],
      pendingApprovals: ['Subir orçamento'],
      facts: [],
    });
    expect(reply).toContain('Subir orçamento');
  });
});
