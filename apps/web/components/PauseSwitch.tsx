'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { dateTime } from '../lib/format';
import type { OfficeSettingsRow } from '../lib/office';
import { createClient } from '../lib/supabase/client';

export interface PauseSwitchProps {
  settings: OfficeSettingsRow;
  /** Injected in tests; defaults to the Supabase RPC `set_office_paused`. */
  onToggle?: (paused: boolean) => Promise<void>;
}

/**
 * Botão de parada geral (regra 6). Calls the `set_office_paused` function, which
 * only the owner may run; every change lands in `audit_log`.
 */
export function PauseSwitch({ settings, onToggle }: PauseSwitchProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { paused } = settings;

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      if (onToggle) {
        await onToggle(!paused);
      } else {
        const { error: rpcError } = await createClient().rpc('set_office_paused', {
          p_paused: !paused,
          p_reason: paused ? null : 'Pausado pelo dono no painel',
        });
        if (rpcError) throw new Error(rpcError.message);
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível mudar o estado.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="pause-title"
      className={`rounded-2xl border p-6 shadow-sm ${
        paused ? 'border-stop/40 bg-stop-soft' : 'border-line bg-surface'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="pause-title" className="text-lg font-bold">
            Parada geral
          </h2>
          <p className="mt-1 text-sm text-muted">
            {paused
              ? `Escritório pausado${settings.paused_at ? ` desde ${dateTime(settings.paused_at)}` : ''}. Nenhum funcionário trabalha até você retomar.`
              : 'Escritório ativo. Um clique pausa todos os funcionários na hora.'}
          </p>
          {paused && settings.pause_reason ? (
            <p className="mt-1 text-sm text-stop">Motivo: {settings.pause_reason}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void toggle()}
          disabled={busy}
          aria-pressed={paused}
          className={`rounded-xl px-5 py-3 text-base font-bold text-white shadow-sm transition disabled:opacity-60 ${
            paused ? 'bg-ok hover:brightness-95' : 'bg-stop hover:brightness-95'
          }`}
        >
          {busy ? 'Aguarde…' : paused ? 'Retomar escritório' : 'Parar tudo'}
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-stop">
          {error}
        </p>
      ) : null}
    </section>
  );
}
