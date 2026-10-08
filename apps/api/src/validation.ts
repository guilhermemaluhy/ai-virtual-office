import type { FastifyReply } from 'fastify';
import type { z } from 'zod';

/** Parses `input` or replies 400 with the validation issues. Returns `undefined` on failure. */
export function parseOrReply<T extends z.ZodType>(
  schema: T,
  input: unknown,
  reply: FastifyReply,
): z.infer<T> | undefined {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  void reply.code(400).send({
    error: 'Bad Request',
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  });
  return undefined;
}
