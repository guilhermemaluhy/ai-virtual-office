import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EmployeesList } from './EmployeesList';

describe('EmployeesList', () => {
  it('explains the empty office', () => {
    const html = renderToStaticMarkup(<EmployeesList employees={[]} />);
    expect(html).toContain('Nenhum funcionário contratado ainda');
    expect(html).toContain('Analista de Estoque');
    expect(html).toContain('nenhum contratado');
  });

  it('lists hired employees with role, model and state', () => {
    const html = renderToStaticMarkup(
      <EmployeesList
        employees={[
          {
            id: 'analista-estoque',
            name: 'Helena',
            title: 'Analista de Estoque',
            role: 'analista_estoque',
            model: 'claude-haiku-5-5',
            state: 'working',
            autonomy: 'simulacao',
            active: true,
            hired_at: '2026-11-15T12:00:00Z',
          },
        ]}
      />,
    );
    expect(html).toContain('Helena');
    expect(html).toContain('claude-haiku-5-5');
    expect(html).toContain('Trabalhando');
    expect(html).toContain('1 de 6');
  });
});
