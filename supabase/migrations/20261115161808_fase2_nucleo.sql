-- Fase 2 — Banco e núcleo do Escritório IA da Loja.
-- Tabelas: organizations, owners, office_settings, employees, tasks, approvals,
-- reports, employee_memory, ai_usage, audit_log. Login do dono via Supabase Auth
-- (auth.users); RLS libera leitura/escrita só para o dono. A API e o worker usam a
-- service role (ignora RLS). Os enums espelham @aivo/shared/domain.ts.

-- ---------------------------------------------------------------- enums
create type public.marketplace as enum ('mercado_livre', 'shopee');
create type public.employee_role as enum (
  'analista_estoque', 'gestor', 'catalogo_anuncios', 'preco_margem', 'sac', 'analista_mercado'
);
create type public.employee_state as enum (
  'idle', 'working', 'awaiting_approval', 'meeting', 'alert', 'offline'
);
create type public.autonomy_level as enum ('simulacao', 'aprovacao', 'autonomo');
create type public.risk_level as enum ('read', 'low', 'medium', 'high');
create type public.task_status as enum ('queued', 'running', 'done', 'failed', 'cancelled');
create type public.approval_status as enum ('pending', 'approved', 'rejected', 'undone');

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
comment on table public.organizations is
  'Uma empresa só por enquanto; a coluna organization_id nas demais tabelas deixa a porta aberta.';

insert into public.organizations (id, name)
values ('00000000-0000-4000-8000-000000000001', 'Planeta Infantil');

-- ---------------------------------------------------------------- owners
create table public.owners (
  user_id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null default '00000000-0000-4000-8000-000000000001'
    references public.organizations (id),
  name text,
  created_at timestamptz not null default now()
);
comment on table public.owners is 'Quem pode entrar no painel. O primeiro usuário criado vira dono.';

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.owners where user_id = auth.uid());
$$;

-- O primeiro usuário do Auth vira o dono automaticamente; os seguintes não ganham nada.
create or replace function public.handle_first_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.owners) then
    insert into public.owners (user_id, name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  end if;
  return new;
end;
$$;

create trigger on_first_user_becomes_owner
  after insert on auth.users
  for each row execute function public.handle_first_user();

-- ---------------------------------------------------------------- office_settings (botão de parada geral)
create table public.office_settings (
  organization_id uuid primary key references public.organizations (id),
  paused boolean not null default false,
  paused_at timestamptz,
  paused_by uuid references auth.users (id) on delete set null,
  pause_reason text,
  updated_at timestamptz not null default now()
);
comment on column public.office_settings.paused is
  'Botão de parada geral: true pausa todos os funcionários na hora.';

insert into public.office_settings (organization_id)
values ('00000000-0000-4000-8000-000000000001');

create trigger office_settings_updated_at
  before update on public.office_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- employees
create table public.employees (
  id text primary key,
  organization_id uuid not null default '00000000-0000-4000-8000-000000000001'
    references public.organizations (id),
  role public.employee_role not null,
  name text not null,
  title text not null,
  avatar jsonb not null default '{}'::jsonb,
  goal text not null,
  system_prompt text not null,
  model text not null,
  allowed_tools text[] not null default '{}',
  autonomy public.autonomy_level not null default 'simulacao',
  schedule jsonb not null default '[]'::jsonb,
  daily_budget_micro_usd bigint not null default 0 check (daily_budget_micro_usd >= 0),
  state public.employee_state not null default 'offline',
  active boolean not null default true,
  hired_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, role)
);
comment on table public.employees is 'Os funcionários de IA contratados. Vazia até a Fase 4.';
comment on column public.employees.schedule is 'Lista de expressões cron (horário de Brasília).';
comment on column public.employees.daily_budget_micro_usd is
  'Limite diário de custo de IA em micro-dólares (1 USD = 1.000.000). 0 = sem limite.';

create trigger employees_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default '00000000-0000-4000-8000-000000000001'
    references public.organizations (id),
  employee_id text not null references public.employees (id),
  kind text not null,
  title text not null,
  details text,
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  status public.task_status not null default 'queued',
  requested_by text not null default 'sistema',
  scheduled_for timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.tasks.requested_by is 'dono, gestor, agenda ou sistema.';
create index tasks_employee_status_idx on public.tasks (employee_id, status);
create index tasks_created_at_idx on public.tasks (created_at desc);

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- approvals
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default '00000000-0000-4000-8000-000000000001'
    references public.organizations (id),
  employee_id text not null references public.employees (id),
  task_id uuid references public.tasks (id) on delete set null,
  action text not null,
  summary text not null,
  risk public.risk_level not null,
  payload jsonb not null default '{}'::jsonb,
  before jsonb,
  after jsonb,
  status public.approval_status not null default 'pending',
  decided_by uuid references auth.users (id) on delete set null,
  decision_note text,
  edited_payload jsonb,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  undone_at timestamptz
);
comment on table public.approvals is
  'Pedidos de aprovação: antes/depois, decisão do dono e desfazer com um clique.';
create index approvals_status_idx on public.approvals (status, created_at desc);

-- ---------------------------------------------------------------- reports
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default '00000000-0000-4000-8000-000000000001'
    references public.organizations (id),
  employee_id text references public.employees (id),
  task_id uuid references public.tasks (id) on delete set null,
  kind text not null,
  title text not null,
  content text not null,
  data jsonb not null default '{}'::jsonb,
  period_start date,
  period_end date,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
comment on column public.reports.content is 'Markdown em português simples, para o dono ler.';
create index reports_created_at_idx on public.reports (created_at desc);

-- ---------------------------------------------------------------- employee_memory
create table public.employee_memory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default '00000000-0000-4000-8000-000000000001'
    references public.organizations (id),
  employee_id text not null references public.employees (id) on delete cascade,
  key text not null,
  content text not null,
  importance smallint not null default 0 check (importance between 0 and 10),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, key)
);
comment on table public.employee_memory is
  'Memória de longo prazo de cada funcionário. pgvector entra quando precisar.';

create trigger employee_memory_updated_at
  before update on public.employee_memory
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- ai_usage
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default '00000000-0000-4000-8000-000000000001'
    references public.organizations (id),
  employee_id text not null references public.employees (id),
  task_id uuid references public.tasks (id) on delete set null,
  model text not null,
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  cache_read_tokens integer not null default 0 check (cache_read_tokens >= 0),
  cache_write_tokens integer not null default 0 check (cache_write_tokens >= 0),
  cost_micro_usd bigint not null default 0 check (cost_micro_usd >= 0),
  duration_ms integer,
  created_at timestamptz not null default now()
);
comment on table public.ai_usage is 'Modelo, tokens e custo por funcionário e tarefa (regra 10).';
create index ai_usage_employee_created_idx on public.ai_usage (employee_id, created_at desc);

-- Quanto um funcionário já gastou hoje (horário de Brasília).
create or replace function public.employee_cost_today_micro_usd(p_employee_id text)
returns bigint
language sql
stable
set search_path = public
as $$
  select coalesce(sum(cost_micro_usd), 0)::bigint
  from public.ai_usage
  where employee_id = p_employee_id
    and created_at >= date_trunc('day', now() at time zone 'America/Sao_Paulo')
      at time zone 'America/Sao_Paulo';
$$;

-- ---------------------------------------------------------------- audit_log
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null default '00000000-0000-4000-8000-000000000001'
    references public.organizations (id),
  actor text not null,
  actor_user_id uuid references auth.users (id) on delete set null,
  employee_id text references public.employees (id),
  action text not null,
  entity text not null,
  entity_id text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);
comment on column public.audit_log.actor is 'dono, sistema ou o id do funcionário.';
create index audit_log_entity_idx on public.audit_log (entity, entity_id);
create index audit_log_created_at_idx on public.audit_log (created_at desc);

-- Toda mudança no botão de parada vai para o log.
create or replace function public.log_office_pause()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.paused is distinct from old.paused then
    insert into public.audit_log (organization_id, actor, actor_user_id, action, entity, entity_id, before, after)
    values (
      new.organization_id,
      case when auth.uid() is null then 'sistema' else 'dono' end,
      auth.uid(),
      case when new.paused then 'office.pause' else 'office.resume' end,
      'office_settings',
      new.organization_id::text,
      jsonb_build_object('paused', old.paused),
      jsonb_build_object('paused', new.paused, 'reason', new.pause_reason)
    );
  end if;
  return new;
end;
$$;

create trigger office_settings_audit
  after update on public.office_settings
  for each row execute function public.log_office_pause();

-- O painel chama esta função para pausar/retomar; só o dono pode.
create or replace function public.set_office_paused(p_paused boolean, p_reason text default null)
returns public.office_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.office_settings;
begin
  if not public.is_owner() then
    raise exception 'apenas o dono pode usar o botão de parada' using errcode = '42501';
  end if;
  update public.office_settings
  set paused = p_paused,
      paused_at = case when p_paused then now() else null end,
      paused_by = case when p_paused then auth.uid() else null end,
      pause_reason = case when p_paused then p_reason else null end
  where organization_id = '00000000-0000-4000-8000-000000000001'
  returning * into result;
  return result;
end;
$$;

-- ---------------------------------------------------------------- RLS
alter table public.organizations enable row level security;
alter table public.owners enable row level security;
alter table public.office_settings enable row level security;
alter table public.employees enable row level security;
alter table public.tasks enable row level security;
alter table public.approvals enable row level security;
alter table public.reports enable row level security;
alter table public.employee_memory enable row level security;
alter table public.ai_usage enable row level security;
alter table public.audit_log enable row level security;

create policy owners_read_self on public.owners
  for select to authenticated using (user_id = auth.uid());

create policy organizations_owner_read on public.organizations
  for select to authenticated using (public.is_owner());

create policy office_settings_owner_read on public.office_settings
  for select to authenticated using (public.is_owner());
create policy office_settings_owner_update on public.office_settings
  for update to authenticated using (public.is_owner()) with check (public.is_owner());

create policy employees_owner_all on public.employees
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy tasks_owner_all on public.tasks
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy approvals_owner_all on public.approvals
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy reports_owner_all on public.reports
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy employee_memory_owner_read on public.employee_memory
  for select to authenticated using (public.is_owner());
create policy ai_usage_owner_read on public.ai_usage
  for select to authenticated using (public.is_owner());
create policy audit_log_owner_read on public.audit_log
  for select to authenticated using (public.is_owner());

-- ---------------------------------------------------------------- realtime (o 3D recebe eventos ao vivo)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table
      public.employees, public.tasks, public.approvals, public.reports, public.office_settings;
  end if;
end;
$$;
