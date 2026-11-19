-- Move the role-check helper out of the exposed API schema and pin its search_path.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.has_site_role(required_role text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid()) and ur.role = required_role
  );
$$;
revoke all on function private.has_site_role(text) from public;
grant execute on function private.has_site_role(text) to anon, authenticated;

do $$
declare p record; role_list text; using_expr text; check_expr text; policy_mode text; policy_sql text;
begin
  for p in
    select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    from pg_policies
    where schemaname in ('public', 'storage')
      and (coalesce(qual, '') like '%has_site_role%'
        or coalesce(with_check, '') like '%has_site_role%')
  loop
    select string_agg(quote_ident(role_name), ', ') into role_list
      from unnest(p.roles) as role_name;
    using_expr := case when p.qual is null then '' else
      ' using (' || regexp_replace(p.qual, '(public\.)?has_site_role', 'private.has_site_role', 'g') || ')' end;
    check_expr := case when p.with_check is null then '' else
      ' with check (' || regexp_replace(p.with_check, '(public\.)?has_site_role', 'private.has_site_role', 'g') || ')' end;
    policy_mode := case when p.permissive = 'PERMISSIVE' then 'PERMISSIVE' else 'RESTRICTIVE' end;
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    policy_sql := format(
      'create policy %I on %I.%I as %s for %s to %s%s%s',
      p.policyname, p.schemaname, p.tablename, policy_mode, p.cmd, role_list, using_expr, check_expr
    );
    execute policy_sql;
  end loop;
end $$;

drop function if exists public.has_site_role(text);

create index if not exists admin_audit_logs_actor_id_idx on public.admin_audit_logs (actor_id);
create index if not exists articles_category_id_idx on public.articles (category_id);
create index if not exists project_media_project_id_idx on public.project_media (project_id);
