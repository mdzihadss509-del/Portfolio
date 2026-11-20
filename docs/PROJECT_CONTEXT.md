# Project Context — HADES Portfolio CMS

**Last audited:** 2026-11-20 (Asia/Dhaka)
**Status:** Live production deployment; code and public-site automated checks pass. Final production sign-off remains conditional on owner-only Admin/storage workflows, content population, recovery planning and hosting-plan compliance.
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

- Next.js 16.4.6 App Router, React 19, TypeScript 5.9.
- Supabase Postgres, Auth and Storage via `@supabase/supabase-js` and `@supabase/ssr`.
- Motion 14, Lucide React.
- Playwright and axe-core for browser/accessibility tests.
- Node.js 22.0 or newer (the current Supabase JS dependency requires Node 22+).

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
- `app/api/contact/route.ts` — origin/content-type validation, streaming JSON body cap, honeypot, validation and Supabase insert; current Vercel firewall enforces shared IP rate limiting.
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
- `tests/portfolio.spec.ts` — Playwright browser, contact API, form interaction, accessibility, Admin gate and navigation validation tests.
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


## 20. Production hardening pass — 2026-11-19 23:46 Asia/Dhaka

### Code changes

- Hardened `POST /api/contact`: rejects a mismatched Origin with 403, non-JSON content types with 415, malformed JSON and non-object bodies with 400, and requests above 16 KiB with 413. The body cap is enforced while streaming the request rather than after buffering the whole payload. Validated field lengths/email, retained the honeypot, and added `Cache-Control: no-store` to JSON responses. Shared IP rate limiting continues to be enforced at the active Vercel firewall.
- Fixed a contact-form async event bug: capture the form element before awaiting fetch, then reset the captured form after a successful response. Added a browser interaction test for success feedback, form reset and button recovery.
- Added global response headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive Permissions Policy, and CSP `frame-ancestors 'none'`.
- Removed the wildcard remote-image optimizer hostname from Next config. All current Next Image instances already use `unoptimized`, so images continue to load directly from their configured source without exposing a broad optimizer fetch target.
- Added validation for Admin navigation `href` values. Executable URL schemes such as `javascript:` are rejected; internal anchors such as `#about` remain valid.
- Improved Admin Storage hygiene: upload paths use UUIDs; newly uploaded but unsaved objects are tracked and removed on Cancel/navigation/sign-out or after a successful save when unreferenced. Navigation/cancel/sign-out controls are disabled while an upload or save is in progress to avoid racing cleanup.

### Local verification

- `npm run lint`: passed, 0 warnings/errors.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed.
- `npm run test:e2e`: **18/18 passed**. Tests cover home/navigation, both themes, responsive layouts, 3D/reduced motion, active hero/CTA/loader/reveal, media gallery and preview, no-store, security headers, unsafe URL rejection, SEO endpoints, dark/light serious/critical axe scans, contact success/reset, contact API cross-origin/malformed/null/non-JSON/oversize/honeypot/method checks and Admin sign-in screen.
- `npm audit --audit-level=low`: **0 vulnerabilities**.
- `git diff --check`: passed.
- Tests use a local SVG QA fixture only; no demo rows or real contact messages were written to production.

### Current live Supabase data and advisors

Read-only row counts at this audit: 6 sections, 4 navigation items and 1 social link; 0 projects, skills, experiences, education, services, articles, videos, testimonials, categories, media assets and contact messages. Add only owner-approved real portfolio content; do not seed invented examples.

- Health Advisor: no findings.
- Security Advisor: one WARN, `auth_leaked_password_protection`. Supabase documents this feature as Pro+ only; the connected organization is Free. Do not report it enabled or upgrade the plan without approval.
- Performance Advisor: two INFO unused indexes (`admin_audit_logs_actor_id_idx`, `articles_category_id_idx`). Retain them until real workload data supports a change.
- Supabase Free projects may pause after a week of low activity, and Free projects do not include automatic database backups. An encrypted off-site export and restore test are still required for durable operations.

### Hosting / business-use constraint

The live project currently runs on Vercel Hobby. Vercel Terms restrict Hobby to personal or non-commercial use. This portfolio's documented purpose includes attracting freelance/client enquiries; if used to generate financial gain, the current Hobby host plan is not compliant. Official terms: https://vercel.com/legal/terms and fair-use guidelines: https://vercel.com/docs/limits/fair-use-guidelines.

Netlify currently states its Free plan permits commercial use and supports Next.js App Router/SSR. Migrating would require the owner to connect the repository/account, configure the public Supabase environment variables, recreate the contact rate-limit rule and verify a Netlify preview before moving production traffic. No Netlify account/CLI integration is currently connected, so the verified Vercel site has intentionally been left live rather than silently switching hosts. References: https://www.netlify.com/pricing/ ; https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/ ; https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/.

### Still required for full production sign-off

1. Owner-authenticated test of Admin create/edit/delete, branding/social persistence and real Storage upload/replace/delete. The current automated suite tests the Admin gate and UI logic, not an owner session.
2. Populate projects, skills, work history, articles, testimonials and media with real approved content. Current database collections are empty as listed above.
3. Choose a hosting plan/provider compliant with the site's intended commercial use. For a $0 commercial option, assess and authorize Netlify Free migration; otherwise use an eligible commercial Vercel plan.
4. Configure an owner-controlled custom domain if desired; only `hades-portfolio-amber.vercel.app` is attached now.
5. Set up an encrypted off-site Supabase backup and perform a restore test; Free does not provide automatic backups.
6. Leaked Password Protection remains a paid Supabase Auth feature; two unused-index INFO notices remain non-blocking.

**Status:** App-side code and public-site automated checks are passing. The production deployment is live on the existing Vercel project. Do not describe the site as 100% production-ready for commercial use until the hosting-plan constraint, owner-only Admin/media verification, real content, and recovery arrangements are resolved.


## 21. Latest production deploy verification — 2026-11-19

- Committed and pushed the hardening pass as `02408c1` (`Harden contact flow and production security`) to GitHub `main`. GitHub auto-created production deployment `dpl_A4JzR8j4yuHCbL6Ls7aaPWPwTtuG`; Vercel reports **READY**, exact commit SHA `02408c1f5fbea2ff02f48fe12b8fbb9355a692dc`, and alias `hades-portfolio-amber.vercel.app`.
- Live production browser test passed: page HTTP 200; all added headers present; no JS/page/console errors or failed 5xx responses; dark and light axe scans had zero serious/critical violations; no horizontal overflow at 320/390/768/1024/1440px; hero animation and CTA hover work; contact form mock-success displays feedback and resets all fields.
- Live contact API safe checks: cross-origin POST 403 with `Cache-Control: no-store`; malformed JSON POST 400; GET 405. No production contact row was inserted.
- Latest Vercel runtime error scan (24h): no error clusters. Runtime warning/error event query (30m): no matching logs. The Vercel build still shows the known platform warning `npm warn Unknown env config "cache-dir"`; the build itself completes successfully.
- Reconfirmed active custom Vercel firewall rule: POST `/api/contact`, per-IP fixed window, limit 5 per 600 seconds, deny; rule is valid and active. The active core managed security categories are configured to log rather than block; do not represent them as blocking.
- Reconfirmed only one attached domain: verified Vercel subdomain `hades-portfolio-amber.vercel.app`; no owner-controlled custom domain is configured.
- Final local checks before deploy: lint 0 warnings/errors, TypeScript pass, production build pass, Playwright **18/18**, npm audit 0 vulnerabilities, `git diff --check` pass. Repository working tree was clean after commit.


## 22. Contact write-path hardening and continued QA — 2026-11-20

### Contact API security

- Found that the public Supabase anon insert policy on contact_messages allowed requests to bypass the Vercel /api/contact endpoint and its 5-per-10-minute IP firewall rule.
- Added a server-only CONTACT_SUBMISSION_TOKEN to the Vercel project for Production, Preview and Development. It is stored as a Vercel Sensitive / Secret variable, not a readable encrypted config. It is never prefixed with NEXT_PUBLIC_ and is not included in the browser bundle.
- Updated POST /api/contact to fail closed with 503 when the server-only token is missing and to forward the token only from the server-side Supabase client as x-contact-submission-token.
- Applied production migration 20261119184110_protect_contact_insert_with_server_token.sql. It stores only the token's SHA-256 digest in a private, RLS-enabled table and replaces the anonymous insert policy with a SECURITY DEFINER validation function using PostgREST request headers. The function has a pinned empty search path and its execute privilege is limited to anon. The follow-up migration 20261119184903_deny_client_access_to_contact_submission_secrets.sql adds an explicit restrictive deny-all policy for anon/authenticated on the private secret table.
- Added a local test proving valid-looking submissions fail closed without the server token. Added CONTACT_SUBMISSION_TOKEN to .env.example without adding any value.
- Admin Media Library now explicitly warns that files are publicly viewable by anyone with the URL; private or sensitive documents must not be uploaded there. Existing public bucket access is intentional for portfolio media.

### Continued local verification

- Fresh npm run build: passed.
- Fresh npm run test:e2e against the newly built production server: 19/19 passed (includes the new missing-token fail-closed test).
- npm run lint: passed with 0 warnings/errors.
- npx tsc --noEmit: passed.
- npm audit --audit-level=low: 0 vulnerabilities.
- git diff --check: passed.
- Vercel Firewall active config rechecked: valid POST /api/contact fixed-window rate limit, 5 requests per IP per 600 seconds, deny.
- Vercel env metadata rechecked: CONTACT_SUBMISSION_TOKEN is sensitive with visibility=secret across all three environments, and has no Vercel environment-variable security issue flags.

### Remaining release gates

1. Contact write-path protection is now deployed and verified: real POST /api/contact returns 200, while a direct Supabase REST insert using only the public publishable key returns 401 / 42501 (RLS violation). All temporary QA contact rows were removed; remaining QA rows = 0.
2. Owner-authenticated Admin CRUD and actual media upload/replace/delete tests remain pending because no owner session has been used. Do not request or store an owner password/OTP.
3. Supabase Free still cannot enable Leaked Password Protection; two unused-index INFO findings are retained pending workload evidence.
4. Vercel Hobby remains a hosting-plan constraint for business/commercial use. Check and resolve the plan/provider against the intended use before claiming commercial-production compliance.
5. Real project/blog/media content, off-site database backup and restore test, and custom domain remain owner-side production tasks.

**Status at this checkpoint:** Contact RLS hardening is deployed and verified. Fresh local application checks are clean (19/19 E2E). Full production sign-off is still blocked by the non-code operational items listed below and in Section 23.


## 23. Applied contact RLS verification and migration-history cleanup — 2026-11-20

### Verified live production state

- Production deployment for commit 62610ad929ab03343dbe395ab8de77743e1e7f19 is READY on the existing alias hades-portfolio-amber.vercel.app.
- Live public endpoints: /, /admin, /robots.txt and /sitemap.xml return 200; /qa-media-fixture returns 404 in production; GET /api/contact returns 405.
- After both migrations, a real contact API POST using the server-only Vercel secret returned 200 {"ok":true}.
- A direct POST to Supabase REST /contact_messages using only the public publishable key returned 401 / 42501 with an RLS violation. This confirms the public direct-write bypass is closed.
- The private contact secret table has RLS enabled, no client table privileges, and a restrictive policy denying anon/authenticated access. The SECURITY DEFINER validator remains postgres-owned with an empty search_path.
- All temporary contact QA records were deleted. Query confirms zero remaining HADES_*_QA_20261120 rows.
- All 18 public tables have RLS enabled. Security Advisor now reports only the Free-plan Leaked Password Protection warning; the temporary private-table no-policy INFO has been eliminated. Health Advisor is clean. Performance Advisor retains two unused-index INFO notices; do not drop without workload evidence.
- Vercel runtime error scan: no errors in the selected 24-hour period; the latest 30-minute warning/error log query returned no matching rows.
- The active Vercel Firewall rate limit remains valid: POST /api/contact, per-IP fixed window, 5 requests per 600 seconds, deny.

### Migration source hygiene

- Renamed the local media access migration to its registered remote version: 20261119083007_public_media_assets_read_access.sql.
- Local contact migrations now match their remote applied versions: 20261119184110 and 20261119184903.
- Archived supabase/migrations/001_initial_schema.sql under supabase/legacy/001_initial_schema.sql. It is a stale earlier schema snapshot that includes obsolete role-helper/contact policies. It must never be rerun or put back under active migrations.
- The connected Supabase project records its actual initial baseline as 20261118154243_initial_portfolio_cms_schema. The original canonical SQL for that baseline is not currently mirrored in the active local migrations directory. This has been documented in supabase/legacy/README.md.
- No supabase db push, db reset or migration repair was run. There is no supabase/config.toml/project link in this checkout, and it would be unsafe to attempt a blind migration push while the original baseline source is unreconciled. Restore the canonical baseline SQL/history before using CLI schema reset or push.

### Current verified application state

- Latest local build: pass.
- Playwright on the freshly built production server: 19/19 pass.
- ESLint: 0 warnings / 0 errors.
- TypeScript: pass.
- npm audit --audit-level=low: 0 vulnerabilities.
- git diff --check: pass.
- Vercel deployment dpl_5hKXW2Lbc9jxuTJRZcqb8aYMc7xy: READY, latest source commit 62610ad.

### Remaining blockers before full production sign-off

1. Vercel Hobby is restricted to personal/non-commercial use. This portfolio's stated client/freelance inquiry purpose can constitute commercial use; do not represent Hobby as compliant for a revenue-generating portfolio. Either use an eligible commercial Vercel plan or migrate, with owner approval, to a host whose free tier permits the intended commercial use.
2. Admin owner-authenticated create/edit/delete and actual media upload/replace/delete flows remain untested. Do not request or store owner credentials; an owner must perform an authenticated session while testing.
3. Real approved portfolio projects, skills, experience, education, services, posts, testimonials and media assets still need to be populated. Do not invent or seed false portfolio work.
4. Supabase Free cannot enable Leaked Password Protection; the remaining Security Advisor warning is plan-limited. A weekly pause after low activity and absence of automatic Free-tier backups are separate operational risks; configure encrypted off-site export and perform a restore test.
5. No owner-controlled custom domain is attached; only the Vercel subdomain is live.

**Honest status:** The code, public-site automated tests, live contact form write path, direct-write protection and deploy are verified. The website is live and technically hardened, but it is not honestly 100% production-ready for commercial operation until hosting-plan compliance, owner-only Admin/media verification, real approved content and recovery arrangements are completed.


## 24. Full production QA — 2026-11-20

### Fresh local verification
- Fresh `npm run build`: passed (Next.js 15.5.29; production optimized build).
- `npm run lint`: passed with no ESLint warnings/errors.
- `tsc --noEmit`: passed.
- `npm audit --audit-level=low`: 0 vulnerabilities.
- `git diff --check`: passed.
- Playwright production-server regression: **20/20 passed**. Added direct coverage for the Skills Explorer category filter, text search, and expand-all behavior; all 29 CMS skills are rendered when expanded.
- Existing browser coverage includes navigation targets, dark/light themes, no neon glow, responsive widths 320/390/768/1024/1440px, 3D/reduced-motion, reveal/hero/CTA motion, media gallery/preview, no-store, security headers, SEO endpoints, contact success/reset, contact API rejection paths, both-theme serious/critical axe scans, and Admin sign-in gate.

### Live production checks
- Production deployment `dpl_9ueNf3M7vRWcSmh9hVnBtPqspGwj`, commit `f3387ebddc13534938eee8cf7d22e80a32953a56`, state **READY**; alias `hades-portfolio-amber.vercel.app`.
- Fresh live scrape of homepage returned HTTP 200 and confirmed current hero, sections, 4 projects, 29 skills, 6 services, experience, education, all 6 social/contact links, and skills explorer content.
- Fresh live scrape of `/admin` returned HTTP 200 and confirmed the unauthenticated secure sign-in gate; no public signup is exposed.
- Direct live HTTP checks: `/` 200, `/admin` 200, `/robots.txt` 200, `/sitemap.xml` 200, `/qa-media-fixture` 404 (expected in production), `GET /api/contact` 405 (expected), invalid cross-origin `POST /api/contact` 403 (expected).
- Vercel runtime error clusters over 7 days: none. Current runtime logs show only an informational TLS profile line.
- Build logs show one non-blocking platform warning: npm `Unknown env config "cache-dir"`. Confirmed no project or user `.npmrc` and no corresponding local npm environment config; prior investigation identified this as Vercel build-environment injection. Do not add a fragile project workaround.
- Automated external live-browser runner could not start because its separate wallet balance was negative. The live site was still independently checked via fresh scrape, direct HTTP, and local Playwright production-browser suite.

### Current Supabase state
- Project is ACTIVE_HEALTHY on the Free organization.
- All **18/18** public tables have RLS enabled.
- Health Advisor: no findings.
- Security Advisor: one WARN, `auth_leaked_password_protection`; Supabase organization is Free and the feature is plan-limited. Requires an eligible paid plan to enable.
- Performance Advisor: two INFO unused indexes (`admin_audit_logs_actor_id_idx`, `articles_category_id_idx`); retain pending workload evidence.
- Public media bucket `portfolio-media` is configured public with a 50 MiB upload limit; public files can be accessed by URL. Current media_assets count is 0.

### Current CMS content counts
- Projects 4; Skills 29; Education 1; Experience 1; Services 6; Social links 6; Navigation items 8; Sections 6.
- Blog articles 0; YouTube video records 0; Testimonials 0; Media assets 0.
- Do not invent articles, video records, testimonials, client history, or media to make the CMS appear full.

### Remaining production sign-off gates
1. Owner must sign in and verify real Admin create/edit/delete, settings/social persistence, and Storage upload/replace/delete using their own account. Do not request credentials or OTP in chat.
2. Add real approved blog articles, selected video URLs, actual portfolio media/logo, and testimonials only when genuine; current public page correctly omits empty CMS collections.
3. Supabase Leaked Password Protection is still disabled on Free; paid-plan upgrade is owner decision.
4. Vercel team is Hobby. Vercel Terms restrict Hobby to personal/non-commercial use. Because this portfolio advertises services and invites client enquiries, resolve commercial-hosting compliance before monetized/commercial use. Use an eligible plan or owner-approved alternative host; do not upgrade or migrate without approval.
5. Configure encrypted off-site database backups and complete a restore test. Free plan does not provide automatic backups; low-activity projects can pause.
6. Custom domain is optional but not configured; only the Vercel subdomain is attached.

**Honest sign-off:** Code/build/automated public QA are passing and the live deployment is healthy. Full commercial-production sign-off remains blocked by owner-only Admin/Storage verification, missing real content/media, hosting-plan compliance, and backup/restore operations.


## 2026-11-20 — Media asset detail overlay fix
- Fixed public Media Library detail overlay being positioned relative to transformed/animated card ancestors: render the overlay through a React portal directly under `document.body`.
- Modal now has viewport-level positioning and responsive desktop/mobile sizing; the panel scrolls internally where required, while the page behind it is locked against scroll.
- Added focus management (initial focus, Tab/Shift+Tab loop, restore trigger focus), Escape-to-close, backdrop-to-close, scrollbar compensation, and cleanup that restores previous document styles.
- Added a shared details panel for image, video, audio, PDF, and other downloadable files; non-previewable formats show a clear fallback with a download action.
- Regression coverage includes desktop centering/viewport bounds, page scroll lock, keyboard focus loop, Escape close, focus restoration, backdrop close, and mobile viewport bounds.
- Verification on local production build: `npm run lint` passed; `npx tsc --noEmit` passed; `npm run build` passed; `npm run test:e2e` passed 21/21; `npm audit --audit-level=low` reported 0 vulnerabilities; `git diff --check` passed.
- Pending before release: commit/push to `main`, then verify the Vercel production deployment and live asset detail behavior. This local QA result does not by itself mean the production site has been updated.


## 25. Canonical handover and latest production state — 2026-11-20

**Read first when resuming:** [docs/HANDOFF.md](HANDOFF.md). This is the concise, current source of truth for project identity, branch separation, exact production commit/deployment, website contents, architecture, Supabase security/migration cautions, hosting limitations, QA evidence and next steps. This section supersedes older statements in this chronological log where they conflict.

### Current canonical Git / deployment snapshot
- Repository: https://github.com/mdzihadss509-del/Portfolio
- Local checkout: `C:\Users\zihad\hades-portfolio`
- Production branch: `main`; local tree clean and aligned with `origin/main` at handover.
- Latest main commit: `0be7065` — Use generic close label for asset preview.
- Previous commit: `461a8af` — Fix media asset preview modal positioning and scroll.
- Production deployment: `dpl_HpJRmNrStnCj3Pfk6btTtqDNiZhv`, source commit `0be7065e9ddd0c2baeb456aa95c2595d89ff0a8f`, state READY, alias `hades-portfolio-amber.vercel.app`, aliasError null.
- Live homepage and Admin HTTP checks returned 200. Live robots/sitemap, modal CSS and JavaScript assets returned 200. The shipped JS chunk includes the portal modal and accessible close label.
- Vercel runtime error scan at the time of verification: zero errors in the inspected last hour.
- The Cloudflare experiment remains isolated on `cloudflare-free-evaluation` at `54ef5d3`; it is not merged or deployed to production.

### Latest Media Library detail modal correction
- Updated `components/MediaShowcase.tsx`, `app/globals.css`, `tests/portfolio.spec.ts`.
- Modal renders via React portal under `document.body`; fixed viewport centering is no longer affected by transformed card ancestors.
- Background scroll is locked; modal content scrolls internally; prior styles and focus are restored on close.
- Added initial focus, keyboard focus loop, Escape/backdrop close, mobile sizing, and image/video/audio/PDF/download fallback handling.
- Full Playwright run at the main fix checkpoint: 21/21 passed. After the final close-label-only adjustment, lint, TypeScript, focused modal E2E and diff checks passed; the full suite was not rerun after that final tiny adjustment.
- Production deploy is READY and the new CSS/JS is live. A real interactive browser session against the live published modal was not run; do not claim it was.

### Current website content snapshot
- Projects 4; Skills 29; Services 6; Experience 1 (Founder & Creator, Black Flash Hades); Education 1 (ongoing college education, institution unspecified); social/contact links 6; navigation 8.
- Blog articles 0; YouTube video records 0; Testimonials 0.
- Latest owner test media upload recorded one image titled `test` (229.3 KB JPG); verify current live count before any change.
- Never invent qualifications, formal employment, client work, testimonials, posts, video records or assets.

### Operational/security facts to retain
- Supabase project `oxwadruhiavxftcglplx`, organization `svelizeibygdshlcnvcu`, Free plan, last checked ACTIVE_HEALTHY; all 18/18 public tables have RLS.
- Contact submissions are routed through the server-only `CONTACT_SUBMISSION_TOKEN`; direct public-key REST insert is blocked. Never expose or print the token.
- Public bucket `portfolio-media` is intentionally public, 50 MiB limit; do not upload private documents.
- The actual original DB baseline is `20261118154243_initial_portfolio_cms_schema`. `supabase/legacy/001_initial_schema.sql` is stale and must never be replayed. Do not run db push/reset/repair until canonical baseline and remote migration history are reconciled.
- Supabase Free cannot enable Leaked Password Protection; two unused-index INFO findings are non-blocking; Free has no automatic DB backups and may pause after low activity.
- Vercel Hobby has personal/non-commercial restrictions; commercial use compliance is unresolved. No plan upgrade or host migration without owner approval.
- No custom domain is attached.
- Owner-authenticated Admin CRUD and real Storage upload/replace/delete remain pending; never request owner password/OTP.

### Next production sign-off gates
1. Owner verifies Admin CRUD, settings/social persistence and Storage upload/replace/delete in their own session.
2. Add genuine owner-approved content where required.
3. Resolve hosting-plan compliance before commercial use, without spending unless explicitly approved.
4. Create encrypted off-site Supabase backup and perform a restore drill.
5. Optionally attach a custom domain after hosting choice.
6. Run full E2E after the next code change and perform an interactive live-browser modal check.

**Honest status:** application code, build and automated public-site QA are passing; latest production deployment is live and READY. This is not a 100% production/commercial sign-off yet. See `docs/HANDOFF.md` for exact details and the resumption checklist.


## 26. 2026-11-20 — Hero intro and layout refinement

- Restored the Hero greeting: "Hi, I’m Zihad — founder of Black Flash Hades."
- Saved the full curiosity-led introduction in Supabase `sections.home.content.intro`.
- Hero headline changed to `ZIHAD / BEYOND THE ORDINARY.` with supporting line `DRIVEN BY CURIOSITY.`.
- Preserved the selected-work CTA, founder kicker and `IDEAS / SYSTEMS / EXPERIENCES` label.
- Refined type scale, paragraph measure and spacing; mobile/tablet now place the copy before the signature emblem. A 1024px headline/artwork collision found during testing was fixed.
- Added hero text assertions and responsive geometry coverage for 390/768/1024/1440px.
- Final local QA: lint, TypeScript, production build and full Playwright suite **22/22 passed**; `git diff --check` passed.
- Record the resulting exact commit and Vercel production deployment after push/verification. Until that is confirmed, do not describe the new code layout as live.


## 27. Canonical handover refresh — 2026-11-20

The single current operational source of truth is now **[docs/HANDOFF.md](HANDOFF.md)**. It was refreshed after the Hero update was committed, pushed and deployed.

### Current verified state (supersedes older snapshots in this chronological log)

- GitHub: https://github.com/mdzihadss509-del/Portfolio
- Production branch: main
- Local checkout: C:\Users\zihad\hades-portfolio
- Latest commit: 6af897f7f6e019133fbf557561cb0682a523f021 — Refine curiosity-led hero identity and layout
- Git tree at handover: clean; local main aligned with origin/main.
- Production site: https://hades-portfolio-amber.vercel.app/
- Production Admin: https://hades-portfolio-amber.vercel.app/admin
- Latest Vercel deployment: dpl_J546QTvnEtzJVeW4Rrz5sAe9E7Cv
- Deployment URL: https://hades-portfolio-bsci36j6l-mdzihadss509-1195.vercel.app
- Deployment state/target: **READY / Production**, source branch main, exact source commit above.
- Live alias and deployment URL both returned HTTP 200; live homepage HTML confirmed the latest greeting, BEYOND THE ORDINARY heading and DRIVEN BY CURIOSITY line.

### Latest local QA

After final hero responsive CSS refinement:
- git diff --check passed.
- npm run lint passed.
- npx tsc --noEmit passed.
- npm run build passed.
- Full Playwright suite passed **22/22**, including hero geometry at 390/768/1024/1440px and regression checks for homepage, skills, themes, motion, media, accessibility, contact validation/security and Admin sign-in gate.

### Documentation layout

- docs/HANDOFF.md is the single current operational handover and must be read first when resuming work.
- README.md now points directly to that canonical handover and contains concise setup/security information.
- This file remains a chronological history only. Earlier sections contain dated snapshots; they must not override the latest values in docs/HANDOFF.md.

The Hero copy/layout update is committed, pushed and deployed. Do not repeat the former notes saying this change was still local or awaiting deployment.

### Remaining operational sign-off

Owner-authenticated Admin CRUD and Storage lifecycle checks, encrypted off-site backup/restore, commercial hosting-plan compliance, genuine content population where needed, optional custom domain, and a live interactive check of the published media modal remain separate tasks. This is not a claim of 100% commercial-production sign-off.


## 28. 2026-11-20 — Production readiness audit, Next.js 16 and clean-install QA

### Work completed
- Upgraded Next.js from 15.5.29 to 16.4.6 and aligned `eslint-config-next` to 16.4.6.
- Updated Supabase SSR to 0.12.7 and Supabase JS to 2.119.2.
- Added Node.js engine requirement >=22.0.0; the connected Vercel project currently reports Node 26.x.
- Migrated the ESLint configuration from legacy FlatCompat to Next 16's native flat-config exports. This removed the circular config error introduced by the major upgrade.
- Fixed two React effect findings surfaced by the Next 16 lint rules: Admin table requests are now abortable when a CMS module changes/unmounts, and ThemeToggle no longer calls React setState on mount. Theme persistence gracefully handles unavailable browser storage.
- Added HSTS and tightened CSP with base-uri, form-action and object-src restrictions while preserving existing frame denial.
- Corrected the saved CMS display name/SEO values from stale H.HADES copy to Zihad; current title is "Zihad | Creator & Developer". HADES remains the brand and social profile links were left unchanged.
- Updated README and handover runtime guidance, refreshed old Next/Node references in the project-context header, and expanded .gitignore for Vercel/Turbo output while removing its UTF-8 BOM.
- Added regression assertions for current SEO metadata and new security headers.
- No Supabase schema or migration changes were performed.

### Fresh clean-install evidence
- `npm ci --no-audit`: installed 382 packages from package-lock.
- Direct dependency tree verified at Next 16.4.6, React/DOM 19.3.1, Supabase SSR 0.12.7, Supabase JS 2.119.2, ESLint config Next 16.4.6, ESLint 9.39.5, Lucide React 0.468.0 and TypeScript 5.9.3.
- `npm run lint`: passed, no findings.
- `npx tsc --noEmit`: passed.
- `npm audit --audit-level=low`: 0 vulnerabilities.
- `npm run build`: passed using Next 16.4.6 Turbopack.
- `npm run test:e2e`: **23/23 passed** after the clean install.
- `git diff --check`: passed (Git emitted only its usual CRLF normalization notices).

### Current operational blockers (not fixable through code-only deployment)
- Production owner must still verify authenticated Admin CRUD/settings/social persistence and actual Storage upload/replace/delete in their own session.
- Supabase Free cannot enable Leaked Password Protection; a plan change would require owner approval.
- Supabase Free does not provide automatic backups; encrypted off-site backup and restore drill remain open.
- Vercel Hobby's commercial-use terms need owner review before commercial/revenue-generating use. No spending or migration was authorized.
- No custom domain is connected.
- Full interactive live verification of production owner-only flows and the Media Archive modal remains outstanding.

This code and QA checkpoint is fully tested locally after a clean install. Record the exact Git commit, Vercel deployment ID/state and live HTTP/header/SEO smoke results in `docs/HANDOFF.md` after the production push; do not infer deployment success from local tests.
