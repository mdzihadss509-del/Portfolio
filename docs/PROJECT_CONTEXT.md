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

The local/GitHub source paths currently include:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/20261119082940_public_media_assets_read_access.sql`

These local filenames do **not** match the live migration versions. In addition, the live database contains icon-related columns such as `icon_url` and `icon_name` on several CMS tables (and `thumbnail_url` on videos) that are not fully represented in the original 001 schema file. Some current read/Storage policies are also separate from that original bootstrap SQL.

Therefore:
- Do not run the repository's current migrations against the existing connected database.
- Do not assume a fresh Supabase database can be reproduced accurately from the current migration folder.
- Before a new installation or Supabase CLI migration workflow, reconcile migration versions and rebuild a complete, reviewed schema snapshot from the live schema and policies.
- Preserve current Admin write/delete protections. After any schema/policy update, verify with read-only SQL and Supabase advisors.

## 6. Security and performance findings

Supabase advisors reported:
- Security warning: `public.has_site_role(required_role text)` is a SECURITY DEFINER function callable by `anon` and `authenticated`. RLS and Storage policies depend on it, so review carefully; do not simply revoke EXECUTE without testing the resulting policies.
- Security warning: Leaked Password Protection is disabled in Supabase Auth.
- Performance warning: 77 multiple-permissive-policy findings, largely from admin ALL policies overlapping public read policies.
- Performance info: missing covering indexes for `admin_audit_logs.actor_id`, `articles.category_id` and `project_media.project_id`.

These are review items, not proof of an exploitable incident. Do not make production policy changes without understanding the effects and verifying Admin access, public reads and uploads/deletes afterward.

The contact route uses an in-memory Map for rate limiting (5 requests per 10 minutes per forwarded IP). This is process-local and not durable across serverless instances; consider a distributed/persistent rate limiter before production.

## 7. Latest verification snapshot — 2026-11-19

Fresh local checks performed after the latest Media Archive source changes:
- `npm run build`: **passed**, exit code 0. Next.js compiled and generated all six static pages.
- `npx tsc --noEmit`: **passed**, exit code 0.
- `npm run lint`: **passed**, 0 errors and 18 warnings. Warnings include explicit `any` types, `<img>` elements where Next Image optimization may be appropriate, and internal `<a>` navigation.
- `npm run test:e2e`: **6 passed, 1 failed** on the latest full rerun.

Playwright tests that passed:
- One primary heading and valid navigation targets.
- Responsive widths 320, 390, 768, 1024 and 1440 px without horizontal overflow.
- Hero pointer 3D tilt and reduced-motion behavior.
- Media Archive renders the two real live image assets and filters work.
- No serious/critical axe violations in site-owned UI (third-party YouTube iframe excluded).
- Admin sign-in fields are labelled and no public signup is shown.

The failing test is `both themes use solid black or white with no neon glow`. Browser measurements confirmed:
- Dark: page/body canvas is black (`rgb(0,0,0)`), but Media Archive card/preview surfaces are `rgb(8,8,8)`, failing the strict pure-black test.
- Light: `html` and `main` are white, but `body` measured black; `.work-section` measured light blue (`rgb(243,247,255)`), `.creator-band` measured blue (`rgb(36,89,230)`), and Media Archive cards/previews remained dark (`rgb(8,8,8)`).
- A scan for `box-shadow`, `text-shadow` and CSS `filter` returned zero glowing elements.

The theme test currently fails first on the dark card surfaces; light theme was also measured separately and has the defects above. Keep the test strict and fix the actual CSS cascade rather than weakening assertions.

No production deployment has been performed.

## 8. Known gaps and next tasks

### Priority 0 — theme defect
1. Make every dark theme canvas/card/preview pure black where required.
2. Make every light theme canvas, section, card and preview pure white.
3. Fix `body` not following the light theme, blue/tinted work and creator sections, and dark Media Archive surfaces in light mode.
4. Preserve purple/red accents in dark mode and blue/red accents in light mode, without tinting large surfaces.
5. Inspect and consolidate duplicate historical CSS overrides rather than appending yet another override layer.
6. Re-run both-theme browser measurements and get all seven Playwright tests passing.

### Priority 1 — functional integration
1. Sign in using the existing Admin account and verify role-gated access.
2. Exercise safe create/edit/delete for representative CMS tables.
3. Verify site settings, logo/favicon, navigation, icon selection and persistence after save/reload.
4. Test image and non-image uploads (video, audio, PDF, Office and archive), public display, download/open behavior, replace and delete.
5. Verify deleting a Media Library record also removes its Storage object.
6. Submit a safe test contact message only with permission and verify the resulting `contact_messages` record.

### Priority 1 — backend/security
1. Review SECURITY DEFINER function exposure without breaking RLS/Storage policies.
2. Enable leaked-password protection in Supabase Auth after review.
3. Review/optimize duplicate permissive RLS policies.
4. Add the three missing FK indexes through a reviewed migration and verify advisor results.
5. Reconcile the migration folder with the live migration history and full current schema before fresh setup.

### Priority 2 — code quality
1. Replace explicit `any` types with safer types.
2. Consider Next.js `Link` for internal routes and `Image` where appropriate; retain custom Storage URL behavior.
3. Audit dead/duplicate code, stale CSS selectors, unused assets and abandoned dependencies before deleting anything.
4. Add automated tests for Admin CRUD, contact submission and actual non-image media workflows.
5. Consider persistent/distributed rate limiting for the contact endpoint.

### Deployment and content
- No production host/domain is configured in this handover.
- No deployment has been done. Do not deploy unless explicitly requested.
- Populate empty CMS collections only with owner-provided/approved content.
- Verify personal text, links, SEO and social destinations before launch; do not invent portfolio content.

## 9. Repository hygiene and continuation workflow

- GitHub repository is `mdzihadss509-del/Portfolio`, branch `main`.
- The repository contains application source, configs, tests, public SVG icons, README and this handover document.
- `.env.local`, `node_modules`, `.next`, backups, Playwright reports/results and local TypeScript build metadata must stay out of Git.
- Local Git initialization/remote tracking must be checked before the next local commit; the original local project directory did not have a `.git` directory during the audit.

For every future session:
1. Read `README.md` and this file first.
2. Check the current GitHub `main` commit and local `git status` before editing.
3. Make focused changes and inspect the diff.
4. Preserve the Admin media upload/delete code unless the owner explicitly asks to change it.
5. Before Supabase work, inspect live schema, policies and migration history.
6. Run checks serially (avoid parallel Next build/type/test processes that race over `.next`).
7. After meaningful work, update the verification results and remaining tasks in this file.
8. Commit only source, configuration, tests, docs and reviewed migrations; never secrets or generated artifacts.


## 2026-11-19 theme correction and verification

- Strict final theme override applied: dark page and major section canvases are pure black (#000000); light page and major section canvases are pure white (#ffffff). Neon glow, luminous shadows, text glow, decorative overlays and glow filters are disabled. The hero orb is now a neutral flat element.
- Focused Playwright test for both themes passed after remaining #080808 section backgrounds were corrected to exact black/white.
- The full Playwright run immediately before the final adjustment had 6 passing tests and 1 theme test failure; the focused theme test passed after the correction. The full 7-test suite was not rerun after that final correction.
- TypeScript check passed. ESLint: 0 errors, 18 warnings remain (any types, raw img tags, internal anchor links).
- Production build passed after the final theme CSS adjustment. Routes built: /, /admin, /api/contact, /blog/[slug].
- Local commits: ce71e2d (theme correction) and ca11369 (handover status). No production deployment.
- Remaining: resolve lint warnings; full authenticated Admin CRUD and actual media upload tests require an admin session and sample files; rerun full Playwright suite once; clean obsolete local backup files only after confirming they are not needed; production deployment not performed.


## 2026-11-19 production-readiness verification

### Confirmed in this session
- Clean `npm run build`: **passed**, exit code 0. Routes generated: `/`, `/admin`, `/api/contact`, `/blog/[slug]`.
- `npx.cmd tsc --noEmit`: **passed**, exit code 0.
- `npm run lint`: **passed**, 0 errors and 18 warnings remain.
- Production-mode server started with `next start`; `/` and `/admin` both returned HTTP 200.
- Full Playwright suite against the production-mode server: **7/7 passed** in 18.9 seconds. This includes theme, responsive widths, pointer 3D/reduced motion, real media gallery/filter, axe serious/critical accessibility, and Admin login screen.
- Contact API validation: cross-origin POST rejected with HTTP 403; malformed payload without Origin rejected with HTTP 400. No test contact message was inserted.
- Confirmed the configured Admin email has an explicit `admin` row in `public.user_roles`; the password was not accessed or changed.
- Confirmed all 18 public tables have RLS enabled.
- Confirmed Storage bucket `portfolio-media` is public for reads, has a 50 MB size limit, and authenticated Admin-role users are required for object INSERT/UPDATE/DELETE.
- Confirmed `media_assets` public SELECT and admin-management policies both exist.
- Confirmed `.env.local` is not tracked by Git; only the placeholder `.env.example` is tracked.
- Local production server is currently running at `http://localhost:3000`.

### Current blockers before calling the project fully production-ready
1. **Admin workflow not end-to-end tested:** the Admin screen is covered, and the Admin role exists, but authenticated login and actual CRUD/settings/icon persistence still require the owner to sign in. Real file upload/replace/delete for video, audio, PDF and archives also needs safe sample files.
2. **Supabase security advisor warnings remain:** `public.has_site_role(text)` is SECURITY DEFINER and callable by anon/authenticated; leaked-password protection is disabled. Do not revoke function EXECUTE blindly because RLS and Storage policies depend on it. Review a private-schema migration and enable leaked-password protection in Supabase Auth settings.
3. **Supabase performance advisor warnings remain:** 3 unindexed foreign keys (`admin_audit_logs.actor_id`, `articles.category_id`, `project_media.project_id`) and 77 multiple-permissive-policy notices. The policies are functionally intentional but should be consolidated only through a reviewed migration and regression checks.
4. **Migration drift remains:** live migration versions and local SQL filenames do not match; the local bootstrap file is not a complete representation of the current live schema. Do not run the current migration folder against the connected production database. Reconcile a complete schema/policy snapshot before setting up a fresh database or adopting Supabase CLI migrations.
5. **Contact rate limiting is process-local:** the current in-memory limit is not shared across serverless instances. Add a persistent/distributed rate limiter (or a trusted edge/WAF rate limit) before high-traffic production use.
6. **Code-quality warnings:** 18 ESLint warnings remain (explicit `any`, raw `img`, and internal anchor usage). They do not fail the production build but should be cleaned in a focused pass.
7. **Hosting/domain not configured:** no production deployment was performed. Set the hosting project, production environment variables, domain and deployment secrets before launch.

### Safe deployment sequence
1. Reconcile/backup the live Supabase schema and policies; do not replay the mismatched bootstrap migrations.
2. Verify the owner can sign in to `/admin`, then test one create/edit/delete cycle in a safe content table and one test upload/replace/delete cycle.
3. Enable leaked-password protection in Supabase Auth; review the SECURITY DEFINER function exposure without breaking policies.
4. Configure production environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never add a service-role key to client-exposed variables.
5. Deploy the current `main` source to the chosen host, run the production build, configure the domain and HTTPS, and verify homepage, Admin, contact form, media and blog on the deployed URL.
6. Re-run the browser suite against the deployed URL and review Supabase security/performance advisors.

**Status:** Production build and public-site regression are verified. The app is deployable to a configured host, but it is not yet certified fully production-ready until the Admin end-to-end checks and the listed security/deployment blockers are resolved.
