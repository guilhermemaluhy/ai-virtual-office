'use client';

import { useRouter } from 'next/navigation';
import { useState, type SyntheticEvent } from 'react';
import { createClient } from '../lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(
        signInError.status === undefined || signInError.status === 0
          ? 'Não foi possível falar com o servidor. Verifique a conexão e tente de novo.'
          : 'E-mail ou senha incorretos.',
      );
      return;
    }
    router.replace('/');
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        E-mail
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Senha
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
      </label>
      {error ? (
        <p role="alert" className="rounded-lg bg-stop-soft px-3 py-2 text-sm text-stop">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-ink disabled:opacity-60"
      >
        {busy ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
