# Project Context — HADES Portfolio CMS

**Last audited:** 2026-11-19 (Asia/Dhaka)
**Status:** In progress. This project is not production-ready.
**GitHub repository:** https://github.com/mdzihadss509-del/Portfolio
**Default branch:** main
**Local project:** `C:\Users\zihad\hades-portfolio`
**Local website:** http://localhost:3000/
**Admin route:** http://localhost:3000/admin

> Read this file before making future changes. Update the verification results and remaining-work list after each substantial task. Never mark an untested feature as complete.

## 1. Purpose and product requirements

A personal portfolio/CMS for personal branding, showcasing projects, creator work, finding clients/freelance opportunities, and receiving enquiries. The owner expects content, logo, images, social links, navigation and website settings to be editable through the Admin Panel.

### Visual contract

- Dark theme: pure black canvas (`#000000`), white text, purple primary accent and a small amount of red.
- Light theme: pure white canvas (`#ffffff`), dark text, blue primary accent and a small amount of red.
- No neon glow, luminous shadow, glow filters, or large colored/gradient section fills.
- Restrained motion, responsive layouts, glass-inspired media cards, and pointer-based 3D interactions.
- Preserve the HADES brand, H monogram and Admin-controlled branding.
- Test actual computed styles on `html`, `body`, `main`, every section and card in both themes. A correct root background alone is not sufficient.

## 2. Technology and local setup

- Next.js 15.5.29 App Router, React 19, TypeScript 5.9.
- Supabase Postgres, Auth and Storage via `@supabase/supabase-js` and `@supabase/ssr`.
- Motion 14, Lucide React.
- Playwright and axe-core for browser/accessibility tests.
- Node.js 20.9 or newer.

Environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Legacy fallback accepted by the code: `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Local setup:
1. `npm ci`
2. Copy `.env.example` to `.env.local`.
3. Add the Supabase URL and publishable key to `.env.local`.
4. Run `npm run dev`.

Useful commands:
- `npm run dev` — development server.
- `npm run lint` — ESLint.
- `npx tsc --noEmit` — TypeScript check.
- `npm run test:e2e` — Playwright browser tests.
- `npm run build` — production build.
- `npm start` — serve a production build.

Never commit `.env.local`, service-role keys, passwords, tokens, database dumps or private data. `.env.example` contains blank placeholders only.

## 3. Routes and source layout

Public routes:
- `/` — portfolio homepage.
- `/blog/[slug]` — individual published article.
- `/api/contact` — contact form POST endpoint.
- `/admin` — private CMS workspace.

Core source files:
- `app/page.tsx` — public homepage composition, sections, navigation, Media Archive and footer.
- `app/layout.tsx` — root layout and dynamic metadata.
- `app/globals.css` — global theme, layout and component styles; currently a large stylesheet with historical overrides. Inspect the cascade before editing.
- `app/admin/page.tsx` — Admin sign-in, CMS navigation, generic editor, CRUD and upload/delete handlers.
- `app/api/contact/route.ts` — contact validation, honeypot, basic in-memory rate limit and Supabase insert.
- `app/blog/[slug]/page.tsx` — article detail and metadata.
- `components/ContactForm.tsx` — public contact form.
- `components/ContentIcon.tsx` — Lucide icons, brand SVGs and custom icon URLs.
- `components/MediaShowcase.tsx` — public Media Archive.
- `components/MotionSurface.tsx` — pointer-based 3D tilt using Motion.
- `components/Reveal.tsx` — IntersectionObserver reveal.
- `components/ThemeToggle.tsx` — localStorage-backed theme toggle.
- `lib/public-data.ts` — public Supabase queries and data types.
- `lib/admin-form.ts` — Admin input conversion and validation.
- `lib/supabase.ts` — browser Supabase client.
- `public/icons/*.svg` — 11 social platform icons.
- `tests/portfolio.spec.ts` — seven Playwright tests.
- `supabase/migrations/` — local SQL setup/reference files.

The homepage uses `getPortfolioData()` and refreshes data every 60 seconds. Main CMS sections are driven by the `sections` table; other collections render when corresponding rows are published/visible. Media Archive appears when `media_assets` has records with a non-null `public_url`, and its navigation item is added automatically if needed.

## 4. Admin CMS and preserved behavior

Admin authentication:
- Supabase Auth email/password sign-in.
- The signed-in user must have an explicit `public.user_roles` row with `role = 'admin'`.
- No public signup or default password is exposed in the Admin interface.

The 15 Admin modules are:
1. Page sections
2. Projects
3. Skills
4. Experience
5. Education
6. Services
7. Blog & articles
8. YouTube videos
9. Social links
10. Testimonials
11. Navigation
12. Messages
13. Media library
14. Site settings
15. Categories

The generic editor supports boolean fields, arrays, nested JSON settings, date/time conversion, required-field checks, custom icon choices, social platform selection, and file upload controls.

### Media Library — important preservation rule

- Storage bucket: `portfolio-media`.
- Admin upload size limit: 50 MB per file.
- The bucket is public for viewing; authenticated Admin-role users have upload/update/delete policies.
- The Admin writes media metadata to `public.media_assets`.
- The public archive supports image, video, audio, document, archive/package and generic file cards.
- The public data query includes every row with non-null `public_url`; there is currently no separate public/private visibility field.

**Do not rewrite or break the existing upload, replace and delete logic.** Verify with safe sample files before changing it. Only two existing image assets have been confirmed rendering in the current live website; other formats are implemented but have not yet been validated with real sample uploads.

## 5. Supabase project and live database state

Connected project:
- Ref: `oxwadruhiavxftcglplx`
- Region: `ap-south-1`
- PostgreSQL 17.12
- Project status at audit: `ACTIVE_HEALTHY`
- Storage bucket: `portfolio-media` (public).

All 18 public tables inspected during the audit had RLS enabled.

Approximate row counts from the live database at audit time:
- `user_roles`: 1
- `site_settings`: 4
- `sections`: 6
- `projects`: 2
- `social_links`: 1
- `navigation_items`: 4
- `media_assets`: 2
- `project_media`, `skills`, `experiences`, `education`, `services`, `testimonials`, `categories`, `articles`, `videos`, `contact_messages`, `admin_audit_logs`: 0 each.

Currently visible sections are Home, About, Selected work, Expertise, Creator space and Contact. Other portfolio collections are empty until content is added through Admin.

Confirmed policies:
- `site_settings`: public SELECT is restricted to the safe keys `branding`, `seo`, `contact` and `general`; admin management policy remains.
- `media_assets`: public SELECT for `anon` and `authenticated`; admin management policy remains.
- `contact_messages`: public INSERT; Admin-role users can read/manage.
- Storage bucket `portfolio-media`: public object SELECT; authenticated Admin-role users can INSERT, UPDATE and DELETE.

### Migration history drift — reconcile before fresh setup

The connected database migration history reports:
- `20261118154243` — `initial_portfolio_cms_schema`
- `20261119083007` — `public_media_assets_read_access`

The earlier local/GitHub source paths included:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/20261119082940_public_media_assets_read_access.sql`

These local filenames do **not** match the live migration versions. The live database also contains icon-related columns and policies not fully represented in the original bootstrap SQL.

Therefore:
- Do not run the repository's original migrations against the existing connected database.
- Do not assume a fresh Supabase database can be reproduced accurately from the bootstrap file.
- Before a new installation or Supabase CLI migration workflow, reconcile migration versions and rebuild a complete, reviewed schema snapshot from the live schema and policies.
- Preserve current Admin write/delete protections. After any schema/policy update, verify with read-only SQL and Supabase advisors.

## 6. Security and performance findings

Supabase advisors previously reported:
- Security warning: `public.has_site_role(required_role text)` is a SECURITY DEFINER function callable by `anon` and `authenticated`. RLS and Storage policies depend on it; do not simply revoke EXECUTE without testing the resulting policies.
- Security warning: Leaked Password Protection is disabled in Supabase Auth.
- Performance warning: 77 multiple-permissive-policy findings, largely from admin ALL policies overlapping public read policies.
- Performance info: missing covering indexes for `admin_audit_logs.actor_id`, `articles.category_id` and `project_media.project_id`.

**2026-11-19 update:** The three missing FK indexes have now been added to the live database through migration `add_foreign_key_indexes` and committed as `supabase/migrations/20261119183000_add_foreign_key_indexes.sql`. The latest performance advisor no longer reports unindexed foreign keys; it now reports the three just-created indexes as unused (expected until workload uses them). The 77 multiple-permissive-policy notices remain. Do not change policy logic without a full role/access regression test.

The `has_site_role` function body only checks whether `auth.uid()` has the requested role in `public.user_roles`; however, it remains SECURITY DEFINER and callable by anon/authenticated. Its exposure should be reviewed without breaking policies. Leaked Password Protection must be enabled in Supabase Auth settings.

The contact route uses an in-memory Map for rate limiting (5 requests per 10 minutes per forwarded IP). This is process-local and not durable across serverless instances; use a distributed/persistent rate limiter or trusted edge/WAF rate limit before high-traffic production use.

## 7. Latest verification snapshot — 2026-11-19

Most recent code verification after the PostCSS security override:
- `npm audit`: **0 vulnerabilities**.
- `npm audit --omit=dev`: **0 vulnerabilities**.
- `npx tsc --noEmit`: **passed**.
- `npm run lint`: **passed**, 0 errors and 18 warnings remain (explicit `any`, raw `img`, internal anchor usage).
- Clean `npm run build`: **passed**, exit code 0.
- Production-mode server: homepage and Admin both returned HTTP 200.
- Full Playwright suite against production-mode server: **7/7 passed**.
- Contact API validation: cross-origin POST rejected HTTP 403; malformed payload without Origin rejected HTTP 400. No test contact message was inserted.
- Confirmed configured Admin email has explicit `admin` row in `public.user_roles`; password was not accessed or changed.
- Confirmed all 18 public tables have RLS enabled.
- Confirmed `portfolio-media` Storage bucket is public for reads, 50 MB limit, and authenticated Admin-role users required for object INSERT/UPDATE/DELETE.
- Confirmed `.env.local` is not tracked; only placeholder `.env.example` is tracked.
- Three FK indexes applied successfully and source migration committed to GitHub.
- Local Git branch is synced to GitHub `main` at commit `6c06377`.

## 8. Remaining blockers before full production sign-off

1. **Admin end-to-end verification:** Owner must sign in at `/admin` to test real CRUD, site settings, icon/logo persistence and actual upload/replace/delete with safe sample image/video/audio/PDF/archive files. Automated UI tests only verify the login screen, not authenticated workflows.
2. **Supabase Auth security:** Enable Leaked Password Protection in Supabase Auth settings. No connected action was available to toggle this setting safely.
3. **SECURITY DEFINER review:** Review whether `public.has_site_role(text)` can be moved into a private schema or otherwise hardened; preserve RLS/Storage policy behavior and test every role before changing it.
4. **RLS policy consolidation:** 77 multiple-permissive-policy notices remain. Most are intentional overlaps of admin management and public read policies; avoid broad automated policy edits.
5. **Migration reconciliation:** Original local bootstrap migration history still differs from the live database. The new FK-index migration is additive and already applied; do not replay the original bootstrap migrations against production.
6. **Distributed rate limiting:** Contact endpoint still uses process-local memory. A durable Redis/Upstash/edge rate limiter needs an external provider and credentials.
7. **Code-quality cleanup:** 18 ESLint warnings remain; they do not fail build or tests.
8. **Vercel connection/deployment:** Vercel account has a Hobby team but no linked project. Creating the Git-linked project was blocked because the GitHub integration is not installed for this Vercel account/repository. The local machine also has no Vercel CLI installed. Install/authorize the Vercel GitHub App for `mdzihadss509-del/Portfolio`, then create/link the project. Set production environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel before deployment. No production deployment has been performed.
9. **Domain/content:** Add the desired custom domain and verify all owner-approved portfolio content, links, SEO and social destinations before public launch.

## 9. Safe deployment sequence

1. Install/authorize the Vercel GitHub integration for this repository and link the project to the `main` branch.
2. Configure production environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never add a service-role key to client-exposed variables.
3. Owner signs in to `/admin`; verify one safe create/edit/delete cycle and sample upload/replace/delete.
4. Enable leaked-password protection; review the SECURITY DEFINER function and RLS policy warnings without breaking public reads/Admin access.
5. Deploy to Vercel, configure domain and HTTPS, then verify homepage, Admin, contact form, blog and media on the deployed URL.
6. Re-run Playwright against the deployed URL and re-check Supabase advisors.

**Status:** Core website, build, public-site regression, dependency audit and FK indexes are verified. The project is not yet fully production-ready or live because authenticated Admin workflows, remaining Supabase hardening, distributed rate limiting, Vercel GitHub integration, production environment variables and domain setup remain unresolved.

## 10. Repository hygiene and continuation workflow

- GitHub repository: `mdzihadss509-del/Portfolio`, branch `main`.
- Never commit `.env.local`, service-role keys, passwords, tokens, database dumps or private data.
- Keep `node_modules`, `.next`, backups, Playwright reports/results and local TypeScript build metadata out of Git.
- Before editing, check current GitHub `main` and local `git status`.
- Make focused changes and inspect diffs.
- Preserve Admin media upload/delete behavior unless explicitly asked to change it.
- Before Supabase work, inspect live schema, policies and migration history.
- Run Next build/type/test commands serially to avoid `.next` races.
- After meaningful work, update this handover and remaining-work list.


## 11. Continuation update — 2026-11-19 18:45 Asia/Dhaka

- Full Playwright regression was rerun after the accessibility contrast correction: **7/7 passed** (homepage/navigation, pure black/white themes and no glow, responsive overflow, 3D motion/reduced-motion, media gallery/filtering, serious/critical axe accessibility, and Admin login gate).
- The first rerun exposed four low-contrast micro-labels on the dark canvas. Their contrast was corrected while preserving pure black/white backgrounds; the second full suite passed.
- Production build completed successfully, exit code 0. It still emits 18 non-blocking ESLint warnings (explicit any, raw img and internal anchor usage).
- Supabase migration `secure_private_role_helper_and_fk_indexes` applied successfully. The role-check SECURITY DEFINER helper now lives in the non-exposed `private` schema with an empty search_path; public and Storage policies were recreated to call the private helper. Read-only verification confirms no `public.has_site_role` remains and the private function is executable by anon/authenticated roles as required by policy evaluation.
- Security advisor no longer reports the exposed SECURITY DEFINER function. The remaining security notice is Leaked Password Protection disabled in Supabase Auth; this must be enabled in the Auth dashboard.
- Foreign-key indexes were applied. Performance advisor still reports 77 multiple-permissive-policy findings and 3 new indexes as unused; these are performance notices, not evidence of broken access. Do not mass-edit RLS without role regression tests.
- Storage policies still require authenticated users with the admin role for upload/update/delete; public read is intentional for portfolio media.
- Owner-authenticated Admin CRUD and real multi-format upload/delete remain unverified because no admin password or safe sample files were supplied. Do not request or store the owner's password in chat.
- Vercel account discovery shows a Hobby team but no Git-linked projects. GitHub App authorization for the repository and production environment-variable setup remain deployment blockers.
- The migration has been applied to the connected database. The original bootstrap migration filenames still differ from live migration history; do not replay bootstrap migrations on the existing database.

**Current verified state:** local production build passes, full Playwright suite 7/7 passes, Supabase role-helper hardening is applied, public website returns HTTP 200. **Not yet production-live:** authenticated Admin workflow sign-off, Auth leaked-password setting, Vercel GitHub integration/project, production environment variables, and domain/live verification.


## 12. Production deployment — 2026-11-19 18:47 Asia/Dhaka

- Created Vercel Hobby project `hades-portfolio` (project ID `prj_i0FEfGBdlXVHhiXkgwVnePBQdRi2`) in team `mdzihadss509-1195`.
- Configured `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for Production, Preview and Development. No service-role key was added.
- Deployed the 32 required source/config/icon files directly to Vercel. Production deployment `dpl_5mUDHsBdeaXUHda9A9UTvdAYrMcs` completed with state **READY**. Build output confirms Next.js 15.5.29 and generated routes `/`, `/admin`, `/api/contact`, `/blog/[slug]`.
- Production URL: https://hades-portfolio-amber.vercel.app (secondary alias: https://hades-portfolio-mdzihadss509-1195.vercel.app).
- Changed Vercel SSO protection to apply to Preview deployments only; the production portfolio URL is public. Preview deployments remain protected.
- Post-deploy smoke checks: homepage HTTP **200**, Admin sign-in route HTTP **200**. Admin route correctly shows the protected email/password sign-in screen and no public signup.
- A clearly synthetic published project row (`title=test`, `slug=new-project44`, URLs/images set to `44`) was found in Supabase and safely unpublished (not deleted). The ISR page revalidated and the production homepage no longer includes that test content or broken `src="44"` image.
- The GitHub App is still not installed for this Vercel account/repository, so this deployment is a direct source upload rather than Git-connected. GitHub pushes will **not** automatically deploy until the owner installs/authorizes the Vercel GitHub App and links the repository.

### Remaining production sign-off

1. Owner must sign in to production `/admin` and verify real CRUD, logo/social settings, icon preset persistence, and safe sample upload/replace/delete across image/video/audio/PDF/archive. The password was not requested or accessed.
2. Enable Supabase Auth Leaked Password Protection in the Auth dashboard; the security advisor currently reports only this warning.
3. Performance advisor still reports 77 multiple-permissive-policy notices and 3 new FK indexes as unused. Do not mass-edit policies without access regression tests.
4. Replace the contact endpoint's process-local in-memory rate limit with a distributed/edge limiter before high-traffic use.
5. ESLint still has 18 non-blocking warnings; production build and 7/7 Playwright tests pass.
6. Add and verify the owner's custom domain; no custom domain has been configured.
7. Install the Vercel GitHub App and link `mdzihadss509-del/Portfolio` to restore automatic deployments from `main`.

**Status:** Public production deployment is live and smoke-tested. Full production sign-off remains conditional on authenticated Admin workflows, Auth leaked-password protection, durable rate limiting, and custom domain/GitHub deployment integration.


## 13. Regression and SEO fixes — 2026-11-19

- Fixed the Playwright configuration so every test run starts an isolated production server on port 3111. This prevents the previous running Next.js server on port 3000 from serving stale in-memory manifests while a new build replaces `.next` assets.
- Re-ran the full browser regression suite against the isolated production build: **9/9 passed**. Coverage includes homepage/navigation, theme contrast and backgrounds, mobile overflow at 320/390/768/1024/1440px, 3D and reduced-motion, media filtering, image detail modal (image, metadata, download, close button, backdrop close), favicon/robots/sitemap endpoints, serious/critical automated accessibility, and Admin sign-in screen.
- Fixed the image detail modal being rendered inside the transformed MotionSurface ancestor. It now renders outside the transformed card, occupies the viewport, locks background scrolling, and closes with Escape, close button, or backdrop click.
- Corrected the image preview button accessible name to include its visible “View Details” wording and fixed the hero secondary label contrast/opacity to pass the automated WCAG AA serious/critical check.
- Added dynamic Next metadata: canonical URL, favicon with Admin branding override, robots directives, Open Graph and Twitter metadata.
- Added `/robots.txt` to allow public indexing while disallowing `/admin` and `/api/`, plus a dynamic `/sitemap.xml` containing the homepage and published article URLs.
- Fresh `npm run build`: **passed**, exit code 0. Routes include `/robots.txt` and `/sitemap.xml`.
- `npx tsc --noEmit`: **passed**.
- `npm run lint`: **passed**, 0 errors; 19 non-blocking warnings remain (explicit `any`, raw `img`, internal anchor navigation).
- `npm audit --omit=dev`: **0 vulnerabilities**.
- `git diff --check`: **passed**.

### Still outstanding after this regression fix

- Production deployment of this latest local commit and post-deploy HTTP/browser verification.
- Authenticated Admin CRUD and real upload/replace/delete workflow verification; owner sign-in is needed and no password should be requested in chat.
- Supabase Auth Leaked Password Protection remains disabled until enabled in the Auth dashboard.
- Contact API rate limit is still process-local; durable distributed/edge rate limiting needs a provider and credentials.
- Supabase reports 77 multiple-permissive-policy performance notices; do not mass-edit without role/access regression tests.
- GitHub/Vercel automatic deployment connection remains unverified; verify after the source commit is pushed.


## 14. Security hardening — 2026-11-19 20:14 Asia/Dhaka

- Applied live Supabase migration `consolidate_admin_rls_policies` and committed its source at `supabase/migrations/20261119142007_consolidate_admin_rls_policies.sql`.
- Removed the overlapping Admin `ALL` policies from 16 public tables and replaced them with role-scoped authenticated Admin INSERT/UPDATE/DELETE policies. Contact messages now have a separate authenticated Admin SELECT policy; public contact submissions are restricted to the `anon` role. The safe site-settings SELECT policy explicitly permits the Admin role to read private settings.
- Verified with a transaction under the actual Admin user's authenticated JWT claims: `private.has_site_role('admin') = true`; the Admin can read project/settings rows and the messages table. The transaction was rolled back and made no data changes.
- Supabase Performance Advisor no longer reports `multiple_permissive_policies`. It now reports only the 3 previously added FK indexes as unused (INFO; expected until production workload uses them).
- Supabase Security Advisor still reports only `auth_leaked_password_protection`. This Auth dashboard setting is not exposed by the connected Supabase management tools; enable it in Supabase Dashboard → Authentication → Providers → Email → Password security / Leaked password protection. Do not claim this is enabled until the advisor confirms it.
- Replaced the contact endpoint's process-local Map limiter. Vercel Firewall is enabled and its active configuration contains a valid custom rule matching only `POST /api/contact`, limiting each client IP to 5 requests per 600 seconds (10 minutes), with deny on excess. This is shared edge enforcement across serverless instances; the application route no longer keeps process-local counters.
- Replaced all 9 raw `img` elements with Next.js `Image` components using explicit dimensions and `unoptimized` for user-supplied Supabase/brand URLs; replaced Admin internal home anchors with Next.js `Link`.
- Latest lint run: 0 errors and 6 remaining `no-explicit-any` warnings (3 in Admin dynamic CMS row typing, 1 in homepage branding settings, 2 in public data types). The previous 19 warnings are reduced to 6.
- Fresh production build after the changes: **passed**, exit code 0. TypeScript check passed.
- Owner-authenticated Admin media upload/replace/edit/delete still requires the owner to sign in; no password was requested or handled. Leaked Password Protection remains the only Supabase Security Advisor warning.
- The Vercel Firewall rule was verified active. Full end-to-end production API 429 load testing was intentionally not run because doing so from the owner network would consume its live 10-minute quota.

**Current status:** RLS policy overlap warnings resolved; contact rate limiting moved to shared Vercel edge; all raw image and internal-anchor lint warnings removed. Remaining: enable Auth leaked-password protection in the dashboard, finish 6 type lint warnings, and run authenticated Admin upload/replace/edit/delete with the owner signed in.

- Follow-up regression run after removing the hero-art entrance opacity fade: **9/9 Playwright tests passed**, including automated serious/critical accessibility checks.
pm audit --omit=dev --audit-level=low reports 0 vulnerabilities. git diff --check passed.


## 15. CMS delete consistency and live rendering — 2026-11-19

- Root layout, homepage, published article route, and sitemap are now explicitly dynamic with `revalidate = 0`. This removes the previous 60-second homepage ISR window that could keep deleted media/content visible from stale generated HTML.
- Verified the built homepage response includes `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`; the live HTML no longer includes the media gallery when the database has no published media rows.
- Queried the production `public.media_assets` table: currently **0 rows**. The previously rendered two gallery entries were stale cached HTML; they are not present in the current database. The media gallery now correctly stays hidden when no media records exist.
- Admin list loading now handles tables with and without a `created_at` column (client-side sort only when values exist); this avoids invalid-column failures across CMS modules.
- Admin delete now requests the deleted row back with `.select('id').maybeSingle()`. If RLS/session prevents a real deletion, the UI reports an error instead of falsely saying success. On successful deletion it immediately removes the row from the admin list, cleans the Storage object when applicable, then reloads the database list.
- Published article pages and sitemap also bypass stale caching, so edits/deletes to posts are reflected on the next request.
- Regression coverage added for no-store homepage response. Media tests now account for the live database state (the media-preview test is skipped when there are no currently published image assets; this avoids assuming demo rows exist).
- Verification: `npm run build` passed; `npx tsc --noEmit` passed; Playwright **9 passed, 1 skipped** (skip is because production media_assets currently has zero rows); serious/critical accessibility test passed. Lint: 0 errors, 6 existing `no-explicit-any` warnings.
- Local production response smoke test: HTTP 200, cache-control no-store, no stale media gallery in HTML.

## 16. Production QA verification - 2026-11-19

- Re-ran a clean local production build: `npm run build` **passed**. `npx tsc --noEmit` **passed**.
- Full Playwright production-mode browser suite: **10/10 passed** (homepage/navigation, dark/light theme, responsive widths 320/390/768/1024/1440, motion/reduced-motion, media gallery/filtering, image detail modal/download/close, no-store response, favicon/robots/sitemap, serious/critical axe accessibility, and Admin login gate).
- `npm run lint`: **0 errors**, 6 non-blocking `no-explicit-any` warnings remain in dynamic Supabase CMS row types (`app/admin/page.tsx`, `app/page.tsx`, `lib/public-data.ts`).
- `npm audit --omit=dev --audit-level=low`: **0 production dependency vulnerabilities**. `git diff --check`: passed.
- Live production smoke tests: `/`, `/admin`, `/robots.txt`, `/sitemap.xml` all return HTTP **200**. `/api/contact` GET correctly returns **405**. Homepage and Admin responses send `private, no-cache, no-store` headers.
- Contact API negative tests: invalid Origin POST returns **403**; invalid payload POST returns **400**. No contact message was inserted during these tests.
- Read-only database check: all **18/18 public tables** have RLS enabled. Reviewed `contact_messages`, `media_assets`, `site_settings`, `user_roles`, and `storage.objects` policies: public contact insert is anon-only; Admin data mutations require authenticated Admin role; Storage upload/update/delete requires Admin role; public media reads are intentional.
- Vercel production deployment `dpl_CoxidS7vGzikNmd7MLzWxDiqbx56` is **READY**, attached to `hades-portfolio-amber.vercel.app`, and serves commit `22dbc85356426148009311a3921241678e449765`. Active Firewall config includes the contact POST IP rate limit (5 per 600 seconds).
- Supabase Health Advisor: no findings. Performance Advisor: only 3 INFO unused indexes (do not remove without workload evidence). Security Advisor: one WARN, Leaked Password Protection disabled; it must be enabled in Supabase Dashboard -> Authentication -> Providers -> Email -> Password security.
- **Not yet eligible for 100% production sign-off:** owner-authenticated Admin create/edit/delete and real Storage upload/replace/delete have not been exercised; this requires the owner to sign in (no password requested or handled). Supabase leaked-password protection remains disabled. The project currently has only its verified Vercel subdomain; no owner custom domain was supplied/configured. GitHub automatic deployment linkage is not confirmed; the current production deployment is READY, but do not assume every future push auto-deploys.
- No production content or schema was modified during this QA pass. This section records verification only.

**QA status:** Core public website and production deployment are passing automated and HTTP checks. Keep the final production sign-off conditional until the owner completes the authenticated Admin workflow and leaked-password protection is enabled and rechecked.

## 17. Git auto-deploy and index advisor follow-up - 2026-11-19

- Vercel Git deployment context confirms project `hades-portfolio` (`prj_i0FEfGBdlXVHhiXkgwVnePBQdRi2`) is linked to GitHub repository `mdzihadss509-del/Portfolio` on the Hobby team.
- Latest GitHub `main` commit before this verification was `54b0e61` (`chore: verify GitHub to Vercel auto-deploy`), but Vercel returned no deployment for that SHA. Therefore repository linkage is confirmed, while push-triggered auto-deployment is not yet proven.
- This documentation-only commit is being pushed to `main` as a fresh webhook test. Verify Vercel creates a deployment for its exact SHA before marking auto-deploy as working.
- Rechecked Supabase Performance Advisor: two INFO findings remain for `admin_audit_logs_actor_id_idx` and `articles_category_id_idx`. Both are non-unique, non-primary B-tree indexes; `pg_stat_user_indexes` reports 0 scans and 8 KiB each.
- The production DB is newly provisioned (Postgres started 2026-11-18); `admin_audit_logs` currently has 0 estimated live rows and `articles` 0 estimated live rows. The planner has no workload evidence to justify dropping either index. Keep both indexes; revisit after meaningful production traffic and data accumulation.
- Supabase Health Advisor has no findings. No schema or production data was changed during this check.

## 18. GitHub push-to-production auto-deploy confirmed - 2026-11-19

- Pushed documentation commit `b8fa3329544eea35e66eeb7301c04f56f2a9d674` to GitHub `main`.
- Vercel automatically created production deployment `dpl_H4AjsLBWq34Caj9sXBBxdYrKEujF` from Git source, cloning `mdzihadss509-del/Portfolio`, branch `main`, exact commit `b8fa332`; no manual deployment was created.
- Deployment completed with state **READY** and assigned the production alias `hades-portfolio-amber.vercel.app`.
- Post-deploy smoke tests returned HTTP 200 for `/`, `/admin`, `/robots.txt`, and `/sitemap.xml`.
- Git working tree is clean and `main` is synchronized with `origin/main`.
- Conclusion: GitHub `main` push -> Vercel production auto-deploy is verified. Two Supabase unused-index INFO notices remain intentionally unchanged pending real workload evidence.


## 19. Repeat production QA and hero contrast correction — 2026-11-19

- Re-tested the deployed public site: `/`, `/admin`, `/robots.txt`, and `/sitemap.xml` returned HTTP 200; `/qa-media-fixture` returned 404 as intended in production; `/api/contact` GET returned 405 as intended.
- Production browser smoke check found no JavaScript page errors, console errors, failed network responses, or horizontal overflow at 320, 390, 768, 1024, and 1440px widths. Hero animation is active, and the primary navigation CTA hover moves upward by 3px. The CSS loading spinner and reduced-motion behavior were also checked.
- Contact API negative checks: invalid Origin POST returned 403; malformed payload returned 400. These rejected requests did not create contact records.
- Vercel runtime error clusters over the previous 24 hours: none. Recent production warning/error log query: no records returned.
- A full local regression run initially found one serious WCAG contrast issue on the 8px `IDEAS / SYSTEMS / EXPERIENCES` hero label. Its ancestor and CTA-row entrance animations were fading opacity during the entrance. Changed these hero entrance motions to translate-only so the label remains fully opaque; preserved the site's layout, palette and animation timing intent.
- Expanded the axe accessibility regression to scan both dark and light themes. Final local checks: `npm run lint` passed with no warnings; `npx tsc --noEmit` passed; `npm run build` passed; Playwright **11/11 passed** including both-theme serious/critical accessibility scan; `npm audit --audit-level=low` reported **0 vulnerabilities**; `git diff --check` passed.
- Supabase advisors rechecked: Health has no findings. Security still has one `auth_leaked_password_protection` warning; Supabase's official documentation confirms the feature is available on Pro and above, so it cannot be enabled on this Free project without changing plans. Performance reports two INFO unused indexes (`admin_audit_logs_actor_id_idx`, `articles_category_id_idx`); both are retained pending meaningful workload evidence.
- Owner-authenticated Admin CRUD and actual upload/replace/delete are still not part of the automated sign-off because they require the owner to sign in. No password or OTP was requested or accessed.
- GitHub commit `6b86c30777cda1f06d9ebafba41b7d98ecd6102f` was auto-deployed by Vercel as production deployment `dpl_KpPoEYLLdudbVHZStuW4keyjwdfF`; status **READY**, alias `hades-portfolio-amber.vercel.app`.
- Post-deploy live browser regression confirms no serious/critical axe violations in dark or light theme, no JS/console errors or failed network responses, responsive widths 320–1440px without overflow, working hero entrance, CTA -3px hover, and CSS spinner. Live route smoke: `/`, `/admin`, `/robots.txt`, `/sitemap.xml` HTTP 200; QA fixture HTTP 404 and contact GET HTTP 405 as intended.
- Vercel build still logs `npm warn Unknown env config "cache-dir"` during install and build. Confirmed there is no repository `.npmrc` and no project `NPM_CONFIG_*` environment variable. This matches a recently reported Vercel build-environment injection of `npm_config_cache_dir`, not a source/app configuration warning; track as a platform warning rather than adding a brittle workaround: https://vercel-community-mu.vercel.sh/t/npm-warn-unknown-env-config-cache-dir-caused-by-vercel-build-environment/51678.
