/**
 * Creates the owner's login in Supabase Auth (email + password, already confirmed).
 * The first user created becomes the owner automatically (database trigger).
 *
 *   pnpm owner:create -- dono@exemplo.com 'senha-forte' 'Guilherme'
 *
 * Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (server only).
 */
import { createClient } from '@supabase/supabase-js';
import { loadSupabaseAdminEnv } from '../env.js';

const [email, password, name] = process.argv.slice(2);
if (!email || !password) {
  console.error('uso: pnpm owner:create -- <email> <senha> [nome]');
  process.exit(2);
}
if (password.length < 10) {
  console.error('a senha precisa ter pelo menos 10 caracteres');
  process.exit(2);
}

const env = loadSupabaseAdminEnv();
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: name ? { name } : {},
});
if (error) {
  console.error(`[owner] erro: ${error.message}`);
  process.exit(1);
}
console.info(`[owner] usuário criado: ${data.user.email ?? email} (${data.user.id})`);
console.info('[owner] se foi o primeiro usuário, já é o dono. Entre pelo painel.');
