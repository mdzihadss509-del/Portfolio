# Project Context — Hades Portfolio CMS

**Last reviewed:** 2026-11-19  
**Local project:** `C:\Users\zihad\hades-portfolio`  
**Local URL:** `http://localhost:3000/`  
**Admin URL:** `http://localhost:3000/admin`  
**Repository:** `https://github.com/mdzihadss509-del/Portfolio`  
**Status:** In progress; do not describe as production-ready.

## 1. Purpose

A personal portfolio/CMS intended for personal branding, job opportunities, client hunting and freelancing. The owner expects content, images, logo, links, and site settings to be manageable through the Admin Panel. The site should remain responsive and professional on desktop and mobile.

## 2. Technology

- Next.js 15.5.29 App Router, React 19, TypeScript
- Supabase Postgres/Auth/Storage via `@supabase/supabase-js`
- Playwright E2E (`tests/portfolio.spec.ts`)
- ESLint (`eslint.config.mjs`)
- Local environment values belong in `.env.local`; never commit it.

## 3. Main routes and source layout

- `app/page.tsx` — public homepage, sections, navigation, public data wiring.
- `app/layout.tsx` — root metadata/layout.
- `app/globals.css` — global theme, layout and component styles. This file is large; audit before removing rules.
- `app/admin/page.tsx` — Admin Panel UI and content-management actions.
- `app/blog/[slug]/page.tsx` — article detail route.
- `app/api/contact/route.ts` — contact form API.
- `components/ContactForm.tsx` — public contact form.
- `components/ContentIcon.tsx` — content/social icon rendering and icon preset mapping; preset behavior still needs a complete save/apply audit.
- `components/MediaShowcase.tsx` — public media archive and file-type rendering.
- `components/MotionSurface.tsx`, `Reveal.tsx` — motion/interaction helpers.
- `components/ThemeToggle.tsx` — theme switch.
- `lib/public-data.ts` — public Supabase queries and shared data types.
- `lib/admin-form.ts` — admin form helpers.
- `lib/supabase.ts` — Supabase client setup.
- `supabase/migrations/001_initial_schema.sql` — initial CMS schema and RLS policies.
- `supabase/migrations/20261119082940_public_media_assets_read_access.sql` — public SELECT policy for published media metadata.
- `tests/portfolio.spec.ts` — homepage, theme surface, responsive layout, motion, media archive, accessibility and admin route tests.

## 4. Public site sections

The homepage currently composes the portfolio sections including Home/Hero, About, Selected Work/Projects, Expertise/Skills, Services, Creator Space, Videos, Experience, Education, Journal/Articles, Media Archive, Testimonials and Contact, followed by footer/navigation. The exact visibility and order may also depend on Supabase content and navigation settings.

## 5. Admin and backend data

The initial SQL schema defines: `user_roles`, `site_settings`, `sections`, `projects`, `project_media`, `skills`, `experiences`, `education`, `services`, `testimonials`, `categories`, `articles`, `social_links`, `videos`, `navigation_items`, `contact_messages`, `media_assets`, and `admin_audit_logs`.

Admin authentication/authorization relies on Supabase Auth and the `user_roles` / `has_site_role` policy model. Verify the actual live RLS policies and user role before changing access controls. Never weaken write/delete protections just to make public display work.

### Media archive implementation

- `getPortfolioData()` reads `media_assets` rows with non-null `public_url`, newest first.
- The public page inserts a Media Archive section and navigation item when assets exist.
- `MediaShowcase` classifies images, video, audio, PDF/document, archive and other files, with filters and file actions.
- Two existing image assets were visible in the homepage during the prior browser test.
- A public SELECT RLS policy for `anon` and `authenticated` was applied to `media_assets`; existing admin write/delete policy was not modified.
- Real upload/preview checks for video, audio, PDF, Office and archive samples have NOT been performed. Do not claim these are fully verified.

## 6. Non-negotiable visual requirements

The owner explicitly corrected the visual direction on 2026-11-19:

- **Dark:** page background must be truly black (`#000000`). No neon glow, purple/blue glow, glowing shadows, luminous gradients, or colored section backgrounds.
- **Light:** page background must be truly white (`#ffffff`). No neon glow, colored section backgrounds, or luminous shadows.
- Keep text and UI neutral/readable; accents must be restrained and must not tint large section backgrounds.
- Test actual computed styles on `html`, `body`, `main`, every section, cards and pseudo-elements in both themes. A passing root background alone is insufficient.
- Respect `prefers-reduced-motion`; do not remove useful focus states.

Earlier audit evidence found Light theme still had a blue `work-section` background (`rgb(36,89,230)`), a tinted `creator-band` (`rgb(243,247,255)`), and dark Media Archive card surfaces; `body` was also observed black while light `html/main` were white. These are known issues to re-check and correct.

## 7. Previously verified checks (historical, not a fresh run)

- Playwright: 7/7 tests passed on 2026-11-19 before the latest Git packaging work.
- `npx tsc --noEmit`: passed on 2026-11-19.
- `npm run lint`: 0 errors, 18 warnings on 2026-11-19. Warnings remain to triage.
- A prior production build after the latest Media Archive changes was NOT run.
- No production deployment was performed.

Do not repeat the same check unnecessarily; record date, command and result whenever a fresh check is run.

## 8. Known gaps / next work

1. Fix and verify exact neutral theme backgrounds for all sections and components in both themes; remove glow/neon effects entirely.
2. Audit every public section, page, responsive breakpoint, navigation item, link and interactive control.
3. Audit all Admin panels, forms, CRUD operations, settings, media upload/edit/delete and validation against live Supabase behavior.
4. Specifically verify icon preset selection, preview, persistence after save/reload, and frontend rendering for every supported platform. UI presence is not proof of function.
5. Test real non-image media files (video/audio/PDF/Office/archive/unknown) end-to-end, including correct open/download behavior and mobile layout.
6. Review API route validation, authentication/authorization, RLS and storage policies. Keep secrets server-side.
7. Resolve ESLint warnings and check for dead/duplicate/unreachable code, unused assets, stale CSS selectors and abandoned dependencies. Use search/reference analysis before deleting; preserve functionality.
8. Run one fresh serial verification pass: lint, TypeScript, Playwright, production build, then manual browser smoke tests for both themes and Admin. Avoid parallel Next.js build/type checks that can race over `.next` output.
9. Confirm deployment configuration separately; do not deploy without explicit instruction.

## 9. Cleanup / repository hygiene

The working directory previously had multiple dated `.bak` and `.audit-backup` files, `playwright-report/`, `test-results/`, `.next/`, `node_modules/`, `.env.local`, and `tsconfig.tsbuildinfo`. These are not source deliverables. Git ignore rules exclude them; local backups are retained until a deliberate cleanup decision. `.env.local` must never be committed.

## 10. Safe continuation workflow

1. Read this file and `README.md` first.
2. Inspect `git status` and latest commit before edits.
3. Make a small, focused change; do not overwrite whole CSS or Admin files without a verified diff.
4. Run only the relevant tests for the change, then the final full suite once.
5. Update this document with verified facts, exact failures and outstanding work.
6. Commit only source/config/docs/migrations; exclude secrets, generated artifacts and backups.