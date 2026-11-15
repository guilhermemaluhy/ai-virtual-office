import { redirect } from 'next/navigation';
import { Dashboard } from '../components/Dashboard';
import { NotOwner } from '../components/NotOwner';
import type { EmployeeListRow, OfficeSettingsRow, OwnerRow } from '../lib/office';
import { createClient } from '../lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: owner } = await supabase
    .from('owners')
    .select('user_id, name')
    .eq('user_id', user.id)
    .maybeSingle<OwnerRow>();
  if (!owner) return <NotOwner email={user.email ?? null} />;

  const [{ data: organization }, { data: settings }, { data: employees }] = await Promise.all([
    supabase.from('organizations').select('name').limit(1).maybeSingle<{ name: string }>(),
    supabase
      .from('office_settings')
      .select('paused, paused_at, pause_reason')
      .limit(1)
      .maybeSingle<OfficeSettingsRow>(),
    supabase
      .from('employees')
      .select('id, name, title, role, model, state, autonomy, active, hired_at')
      .order('hired_at')
      .overrideTypes<EmployeeListRow[], { merge: false }>(),
  ]);

  return (
    <Dashboard
      organizationName={organization?.name ?? 'Minha loja'}
      owner={owner}
      settings={settings ?? { paused: false, paused_at: null, pause_reason: null }}
      employees={employees ?? []}
    />
  );
}
