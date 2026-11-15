import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { PauseSwitch } from './PauseSwitch';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe('PauseSwitch', () => {
  it('offers to stop everything while the office runs', () => {
    const html = renderToStaticMarkup(
      <PauseSwitch settings={{ paused: false, paused_at: null, pause_reason: null }} />,
    );
    expect(html).toContain('Parar tudo');
    expect(html).toContain('Escritório ativo');
    expect(html).toContain('aria-pressed="false"');
  });

  it('offers to resume while paused, showing since when and why', () => {
    const html = renderToStaticMarkup(
      <PauseSwitch
        settings={{
          paused: true,
          paused_at: '2026-11-15T15:30:00Z',
          pause_reason: 'Manutenção',
        }}
      />,
    );
    expect(html).toContain('Retomar escritório');
    expect(html).toContain('desde 15/11/2026, 12:30');
    expect(html).toContain('Motivo: Manutenção');
    expect(html).toContain('aria-pressed="true"');
  });
});
