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
