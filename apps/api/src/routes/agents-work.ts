import { chatWithAgent, runCycle } from '@aivo/agents';
import { LlmError, type LlmProvider } from '@aivo/ai';
import type { Database } from '@aivo/db';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { parseOrReply } from '../validation.js';

const chatBody = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30)
    .refine((messages) => messages.at(-1)?.role === 'user', {
      message: 'a última mensagem deve ser do CEO',
    }),
});

export function agentWorkRoutes(
  app: FastifyInstance,
  db: Database,
  llm: LlmProvider,
  now: () => Date,
) {
  /** The CEO talks to an agent. Answered by Claude when configured, otherwise offline. */
  app.post('/agents/:id/chat', async (request, reply) => {
    const params = parseOrReply(z.object({ id: z.string() }), request.params, reply);
    if (!params) return;
    const body = parseOrReply(chatBody, request.body, reply);
    if (!body) return;
    try {
      const answer = await chatWithAgent(db, llm, params.id, body.messages);
      if (!answer) return await reply.code(404).send({ error: 'Not Found' });
      return answer;
    } catch (error) {
      if (error instanceof LlmError) {
        return reply
          .code(error.retryable ? 503 : 502)
          .send({ error: 'AI Unavailable', message: error.message });
      }
      throw error;
    }
  });

  /** Runs one agent work cycle now (the worker also runs it periodically). */
  app.post('/cycle/run', async () => await runCycle(db, now()));

  app.get('/ai/status', () => ({ mode: llm.available ? 'ai' : 'offline', provider: llm.name }));
}
