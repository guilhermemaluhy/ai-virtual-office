import { parseEnv } from '@aivo/shared';
import { z } from 'zod';

/**
 * Public Supabase settings (safe for the browser: the publishable key only reaches
 * what RLS allows). Read through `process.env.NEXT_PUBLIC_*` literally so Next.js can
 * inline them at build time.
 */
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
});

export function getSupabasePublicEnv() {
  return parseEnv(schema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
