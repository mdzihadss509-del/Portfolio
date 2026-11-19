-- Public read access for metadata of media assets intentionally published in the public portfolio.
-- This migration was applied to the connected Supabase project on 2026-11-19.
-- It deliberately changes SELECT only; existing admin write/delete policies are preserved.
drop policy if exists "public read media assets" on public.media_assets;
create policy "public read media assets"
on public.media_assets
for select
to anon, authenticated
using (true);