-- Fase 2 — ajustes apontados pelo Security Advisor do Supabase.
-- Funções de trigger e helpers com security definer não devem ser chamáveis pela API REST
-- por visitantes anônimos; search_path fixo em todas as funções.

alter function public.set_updated_at() set search_path = public;

-- Funções de trigger: ninguém chama direto.
revoke execute on function public.handle_first_user() from public, anon, authenticated;
revoke execute on function public.log_office_pause() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Helpers usados pelas políticas RLS e pelo painel: só usuários logados.
revoke execute on function public.is_owner() from public, anon;
revoke execute on function public.set_office_paused(boolean, text) from public, anon;
revoke execute on function public.employee_cost_today_micro_usd(text) from public, anon;
