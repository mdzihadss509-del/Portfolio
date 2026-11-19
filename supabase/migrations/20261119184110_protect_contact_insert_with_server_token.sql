-- Protect contact form inserts from direct public Data API abuse.
-- Only the trusted Next.js server route holds CONTACT_SUBMISSION_TOKEN.

create table if not exists private.contact_submission_secrets (
  id smallint primary key check (id = 1),
  token_sha256 text not null check (length(token_sha256) = 64 and token_sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now()
);

alter table private.contact_submission_secrets enable row level security;
revoke all on table private.contact_submission_secrets from public, anon, authenticated, service_role;

insert into private.contact_submission_secrets (id, token_sha256)
values (1, 'cbae816f3069c52b28946a2d1ae0192527a85097a658efc6f695aaea4112b659')
on conflict (id) do update
set token_sha256 = excluded.token_sha256,
    created_at = now();

create or replace function private.valid_contact_submission_token()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select coalesce(
    encode(
      extensions.digest(
        coalesce(
          (pg_catalog.current_setting('request.headers', true)::jsonb ->> 'x-contact-submission-token'),
          ''
        ),
        'sha256'
      ),
      'hex'
    ) = (
      select secret.token_sha256
      from private.contact_submission_secrets as secret
      where secret.id = 1
    ),
    false
  );
$function$;

revoke all on function private.valid_contact_submission_token() from public;
grant execute on function private.valid_contact_submission_token() to anon;

drop policy if exists "public insert contact messages" on public.contact_messages;
drop policy if exists "contact submission requires server token" on public.contact_messages;
create policy "contact submission requires server token"
on public.contact_messages
for insert
to anon
with check ((select private.valid_contact_submission_token()));
