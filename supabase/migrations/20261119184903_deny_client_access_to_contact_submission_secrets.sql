-- Make the private contact secret table explicitly deny all client-role access.
-- The SECURITY DEFINER validator is owned by postgres and the table is not FORCE RLS.
create policy "deny client access to contact submission secrets"
on private.contact_submission_secrets
as restrictive
for all
to anon, authenticated
using (false)
with check (false);
