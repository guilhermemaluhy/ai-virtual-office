import { agents, approvals, type Database, listings, products, tasks } from '@aivo/db';
import type { ChatTurn, LlmProvider } from '@aivo/ai';
import { and, desc, eq, inArray, lte } from 'drizzle-orm';
import { type AgentChatContext, buildSystemPrompt, offlineReply } from './chat-text.js';
import { brl } from './engine/money.js';

const integer = (n: number) => n.toLocaleString('pt-BR');

async function facts(
  db: Database,
  ctx: Pick<AgentChatContext, 'role' | 'marketplace'>,
): Promise<string[]> {
  if (ctx.role === 'comprador') {
    const low = await db
      .select()
      .from(products)
      .where(lte(products.stock, 5))
      .orderBy(products.stock)
      .limit(8);
    const total = await db.$count(products);
    return [
      `${integer(total)} produtos no catálogo, estoque único para Mercado Livre e Shopee`,
      ...low.map(
        (p) =>
          `${p.sku} "${p.title}": ${integer(p.stock)} un. em estoque, custo ${brl(p.costCents)}`,
      ),
    ];
  }
  if (!ctx.marketplace) return [];
  const rows = await db.select().from(listings).where(eq(listings.marketplace, ctx.marketplace));
  const active = rows.filter((l) => l.status === 'active');
  const sales = rows.reduce((sum, l) => sum + l.sales30d, 0);
  const revenue = rows.reduce((sum, l) => sum + l.sales30d * l.priceCents, 0);
  const top = [...active].sort((a, b) => b.sales30d - a.sales30d).slice(0, 5);
  const incomplete = rows.filter((l) => l.qualityScore < 60).length;
  return [
    `${integer(active.length)} anúncios ativos de ${integer(rows.length)}; ${integer(incomplete)} com cadastro incompleto (qualidade < 60)`,
    `Últimos 30 dias: ${integer(sales)} unidades vendidas, faturamento aproximado de ${brl(revenue)}`,
    ...top.map(
      (l) =>
        `Top: "${l.title}" ${brl(l.priceCents)}, ${integer(l.sales30d)} vendas, ${integer(l.visits30d)} visitas`,
    ),
  ];
}

export async function loadChatContext(
  db: Database,
  agentId: string,
): Promise<AgentChatContext | undefined> {
  const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
  if (!agent) return undefined;
  const [manager] = agent.reportsTo
    ? await db
        .select({ name: agents.name, title: agents.title })
        .from(agents)
        .where(eq(agents.id, agent.reportsTo))
    : [];
  const [openTasks, pending] = await Promise.all([
    db
      .select({ title: tasks.title })
      .from(tasks)
      .where(and(eq(tasks.agentId, agentId), inArray(tasks.status, ['todo', 'in_progress'])))
      .orderBy(desc(tasks.createdAt))
      .limit(10),
    db
      .select({ summary: approvals.summary })
      .from(approvals)
      .where(and(eq(approvals.requestedBy, agentId), eq(approvals.status, 'pending'))),
  ]);
  const base = {
    name: agent.name,
    title: agent.title,
    role: agent.role,
    marketplace: agent.marketplace,
    managerName: manager ? `${manager.name} (${manager.title})` : null,
    tasks: openTasks.map((t) => t.title),
    pendingApprovals: pending.map((a) => a.summary),
  };
  return { ...base, facts: await facts(db, base) };
}

export interface ChatReply {
  reply: string;
  mode: 'ai' | 'offline';
}

/** Answers the CEO as the given agent, with Claude when available. */
export async function chatWithAgent(
  db: Database,
  llm: LlmProvider,
  agentId: string,
  messages: ChatTurn[],
): Promise<ChatReply | undefined> {
  const ctx = await loadChatContext(db, agentId);
  if (!ctx) return undefined;
  if (!llm.available) return { reply: offlineReply(ctx), mode: 'offline' };
  const { content } = await llm.complete({ system: buildSystemPrompt(ctx), messages });
  return { reply: content, mode: 'ai' };
}
