-- Consolidate overlapping admin/public RLS policies without changing the intended access model.
-- Public SELECT policies retain admin visibility; admin writes are scoped to authenticated users.
DO $$
DECLARE
  p record;
BEGIN
  FOR p IN
    SELECT * FROM (VALUES
      ('articles', 'admin manage articles'),
      ('categories', 'admin manage categories'),
      ('contact_messages', 'admin read and manage messages'),
      ('education', 'admin manage education'),
      ('experiences', 'admin manage experiences'),
      ('media_assets', 'admin manage media assets'),
      ('navigation_items', 'admin manage navigation'),
      ('project_media', 'admin manage project media'),
      ('projects', 'admin manage projects'),
      ('sections', 'admin manage sections'),
      ('services', 'admin manage services'),
      ('site_settings', 'admin manage site settings'),
      ('skills', 'admin manage skills'),
      ('social_links', 'admin manage socials'),
      ('testimonials', 'admin manage testimonials'),
      ('videos', 'admin manage videos')
    ) AS policies(table_name, policy_name)
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policy_name, p.table_name);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK ((SELECT private.has_site_role(''admin'')))',
      'admin insert ' || p.table_name, p.table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING ((SELECT private.has_site_role(''admin''))) WITH CHECK ((SELECT private.has_site_role(''admin'')))',
      'admin update ' || p.table_name, p.table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING ((SELECT private.has_site_role(''admin'')))',
      'admin delete ' || p.table_name, p.table_name
    );
  END LOOP;
END
$$;

-- Contact submissions remain public for anonymous visitors; authenticated non-admins
-- cannot submit directly through the table API.
DROP POLICY IF EXISTS "public insert contact messages" ON public.contact_messages;
CREATE POLICY "public insert contact messages"
  ON public.contact_messages
  FOR INSERT TO anon
  WITH CHECK (true);

-- Admin read access for private messages is kept separate from public inserts.
DROP POLICY IF EXISTS "admin select contact messages" ON public.contact_messages;
CREATE POLICY "admin select contact messages"
  ON public.contact_messages
  FOR SELECT TO authenticated
  USING ((SELECT private.has_site_role('admin')));

-- Admins must be able to read non-public settings in the CMS.
ALTER POLICY "public read safe site settings"
  ON public.site_settings
  USING (
    key = ANY (ARRAY['branding'::text, 'seo'::text, 'contact'::text, 'general'::text])
    OR (SELECT private.has_site_role('admin'))
  );
