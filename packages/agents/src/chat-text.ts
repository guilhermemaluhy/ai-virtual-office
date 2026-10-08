import { type AgentRole, MARKETPLACE_LABELS, type Marketplace } from '@aivo/shared';

/** What each role does, in the words the agents use to introduce themselves. */
export const ROLE_DESCRIPTIONS: Record<AgentRole, string> = {
  diretor:
    'Responde pelo resultado do marketplace, conduz a reunião diária do time e leva ao CEO as decisões de alto impacto.',
  estrategista:
    'Define a estratégia do canal: sortimento, preços e margem, posicionamento e metas. Propõe preços, que sempre passam pela aprovação do CEO.',
  cadastro:
    'Cadastra anúncios completos: título, descrição, fotos, ficha técnica, variações, categoria e frete.',
  ads: 'Cuida dos anúncios patrocinados: campanhas, lances, orçamento e ACOS/ROAS.',
  afiliados: 'Cuida do programa de afiliados: produtos ofertados, comissões e parceiros.',
  campanhas:
    'Planeja campanhas de marketing: datas promocionais, cupons, descontos e eventos do marketplace.',
  atendimento:
    'Responde perguntas pré-venda, mensagens pós-venda, reclamações e mediações, cuidando da reputação da conta.',
  comprador:
    'Cuida do estoque único que abastece os marketplaces: ruptura, giro, cobertura e pedidos de compra.',
};

export interface AgentChatContext {
  name: string;
  title: string;
  role: AgentRole;
  marketplace: Marketplace | null;
  managerName: string | null;
  tasks: string[];
  pendingApprovals: string[];
  facts: string[];
}

const bullet = (items: string[], empty: string) =>
  items.length ? items.map((i) => `- ${i}`).join('\n') : `- ${empty}`;

/** System prompt for chatting with an agent. Data first, so the model answers from it. */
export function buildSystemPrompt(ctx: AgentChatContext): string {
  const area = ctx.marketplace
    ? MARKETPLACE_LABELS[ctx.marketplace]
    : 'todos os marketplaces (estoque compartilhado)';
  return `Você é ${ctx.name}, ${ctx.title} numa empresa que vende em marketplaces (Mercado Livre e Shopee). Você é um agente de IA da equipe e está conversando com o CEO, dono da empresa, que é a única pessoa humana.

Seu papel: ${ROLE_DESCRIPTIONS[ctx.role]}
Sua área: ${area}. Você responde a: ${ctx.managerName ?? 'CEO'}.

Como responder:
- Português do Brasil, direto e cordial, como um colega de trabalho competente. Em geral até 6 frases; use listas curtas quando ajudar.
- Baseie números e fatos apenas nos dados abaixo. Se algo não está nos dados, diga que não sabe e o que precisaria para descobrir.
- Você não executa nada pelo chat. Mudanças na conta (preço, compras, campanhas, ads) viram pedidos de aprovação para o CEO; preço sempre precisa da aprovação dele.
- Os dados são de uma loja simulada enquanto a integração real com os marketplaces não está pronta; mencione isso se o CEO perguntar sobre a origem dos números.

Suas tarefas abertas:
${bullet(ctx.tasks, 'nenhuma')}

Seus pedidos aguardando o CEO:
${bullet(ctx.pendingApprovals, 'nenhum')}

Dados da sua área:
${bullet(ctx.facts, 'sem dados no momento')}`;
}

/** Rule-based answer used when no AI model is configured. */
export function offlineReply(ctx: AgentChatContext): string {
  const parts = [`Oi! Sou ${ctx.name}, ${ctx.title}. ${ROLE_DESCRIPTIONS[ctx.role]}`];
  parts.push(
    ctx.tasks.length
      ? `Agora estou com: ${ctx.tasks.slice(0, 3).join('; ')}.`
      : 'No momento não tenho tarefas abertas.',
  );
  if (ctx.pendingApprovals.length) {
    parts.push(
      `Estou aguardando sua decisão em ${String(ctx.pendingApprovals.length)} pedido(s): ${ctx.pendingApprovals[0] ?? ''}.`,
    );
  }
  if (ctx.facts.length) parts.push(`Na minha área: ${ctx.facts.slice(0, 2).join('; ')}.`);
  parts.push('(Respostas livres ficam disponíveis quando a IA estiver ligada.)');
  return parts.join(' ');
}
