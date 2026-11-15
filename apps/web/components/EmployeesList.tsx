import { AUTONOMY_LABELS, EMPLOYEE_ROLE_LABELS } from '@aivo/shared';
import { dateTime, STATE_LABELS } from '../lib/format';
import type { EmployeeListRow } from '../lib/office';

export interface EmployeesListProps {
  employees: EmployeeListRow[];
}

export function EmployeesList({ employees }: EmployeesListProps) {
  return (
    <section
      aria-labelledby="employees-title"
      className="rounded-2xl border border-line bg-surface p-6 shadow-sm"
    >
      <div className="flex items-baseline justify-between">
        <h2 id="employees-title" className="text-lg font-bold">
          Funcionários
        </h2>
        <span className="text-sm text-muted">
          {employees.length === 0 ? 'nenhum contratado' : `${String(employees.length)} de 6`}
        </span>
      </div>
      {employees.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
          Nenhum funcionário contratado ainda. O primeiro, o <strong>Analista de Estoque</strong>,
          entra na Fase 4, depois da conexão com o Bling.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {employees.map((employee) => (
            <li key={employee.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {employee.name} <span className="font-normal text-muted">· {employee.title}</span>
                </p>
                <p className="text-sm text-muted">
                  {EMPLOYEE_ROLE_LABELS[employee.role]} · {employee.model} ·{' '}
                  {AUTONOMY_LABELS[employee.autonomy]} · desde {dateTime(employee.hired_at)}
                </p>
              </div>
              <span className="rounded-full bg-bg px-3 py-1 text-xs font-semibold">
                {employee.active ? STATE_LABELS[employee.state] : 'Desativado'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
