-- Add covering indexes for foreign keys flagged by the Supabase performance advisor.
create index if not exists admin_audit_logs_actor_id_idx
  on public.admin_audit_logs (actor_id);

create index if not exists articles_category_id_idx
  on public.articles (category_id);

create index if not exists project_media_project_id_idx
  on public.project_media (project_id);
