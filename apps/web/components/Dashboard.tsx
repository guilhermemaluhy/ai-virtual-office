import type { EmployeeListRow, OfficeSettingsRow, OwnerRow } from '../lib/office';
import { EmployeesList } from './EmployeesList';
import { PauseSwitch } from './PauseSwitch';
import { SignOutButton } from './SignOutButton';

export interface DashboardProps {
  organizationName: string;
  owner: OwnerRow;
  settings: OfficeSettingsRow;
  employees: EmployeeListRow[];
}

/** The 2D screen (SPEC_3D, PARTE C): always available, also on the phone. */
export function Dashboard({ organizationName, owner, settings, employees }: DashboardProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Escritório IA da Loja
          </p>
          <h1 className="text-2xl font-bold">{organizationName}</h1>
          <p className="text-sm text-muted">Olá, {owner.name ?? 'dono'}.</p>
        </div>
        <SignOutButton />
      </header>
      <PauseSwitch settings={settings} />
      <EmployeesList employees={employees} />
      <footer className="text-center text-xs text-muted">
        Fase 2 — banco e núcleo. O escritório 3D chega na Fase 5.
      </footer>
    </main>
  );
}
