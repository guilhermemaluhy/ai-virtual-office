'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-muted hover:text-ink"
    >
      Sair
    </button>
  );
}
