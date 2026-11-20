# HADES Portfolio — Start Here / Canonical Handover

**Last verified:** 2026-11-20 (Asia/Dhaka)
**Purpose:** This is the single operational source of truth for continuing the HADES Portfolio project. Start here in every new session. It contains the current project location, live links, code/deployment identity, setup, architecture, recent changes, test evidence, safety constraints and remaining work. Historical notes elsewhere may contain outdated snapshots; this file takes precedence.

## 1. Project at a glance

| Item | Current value |
|---|---|
| Project | HADES Portfolio CMS |
| Owner / identity | Zihad / HADES / Black Flash Hades |
| GitHub repository | https://github.com/mdzihadss509-del/Portfolio |
| Production branch | **main** |
| Local Windows checkout | C:\Users\zihad\hades-portfolio |
| Production website | https://hades-portfolio-amber.vercel.app/ |
| Production Admin | https://hades-portfolio-amber.vercel.app/admin |
| Local website | http://localhost:3000/ |
| Local Admin | http://localhost:3000/admin |
| Git remote | origin → https://github.com/mdzihadss509-del/Portfolio.git |
| Supabase project ref | oxwadruhiavxftcglplx |
| Vercel project | hades-portfolio |
| Production host | Vercel (Hobby) |

**Latest verified Git commit:**
6af897f7f6e019133fbf557561cb0682a523f021 — Refine curiosity-led hero identity and layout

**Latest verified production deployment:**
- Deployment ID: dpl_J546QTvnEtzJVeW4Rrz5sAe9E7Cv
- Deployment URL: https://hades-portfolio-bsci36j6l-mdzihadss509-1195.vercel.app
- Target: Production
- State: **READY**
- Branch: main
- Source commit: 6af897f7f6e019133fbf557561cb0682a523f021
- Vercel Inspector: https://vercel.com/mdzihadss509-1195/hades-portfolio/J546QTvnEtzJVeW4Rrz5sAe9E7Cv

The production alias and deployment URL both returned HTTP 200 in the latest smoke check. The live homepage contains the latest greeting, headline and curiosity tagline. Re-check deployment state before a future release; this snapshot is dated.

## 2. Resume work immediately

Run these commands first. They establish the real current state without searching through old chat history:

Set-Location 'C:\Users\zihad\hades-portfolio'
git status --short --branch
git log -5 --oneline --decorate
git remote -v

Expected state at this handover:
- Branch: main
- Working tree: clean
- Local branch aligned with origin/main
- HEAD: 6af897f
- Production source commit: same full hash as HEAD

If the branch, commit or working tree differs, inspect the difference before editing. Preserve uncommitted owner changes. Do not reset, clean, stash, overwrite or force-push unexplained changes.

**Quick continuation rule:** Read this document, check Git state, then inspect only the files relevant to the requested task. Do not repeat discovery of the repository, deployment, Supabase project or project structure unless the live state has changed.

## 3. Latest completed work

### Hero identity, copy and responsive layout — 2026-11-20

Changed files:
- app/page.tsx
- app/globals.css
- tests/portfolio.spec.ts
- docs/HANDOFF.md
- docs/PROJECT_CONTEXT.md

Updated the public hero:
- Main heading: **ZIHAD** / **BEYOND THE ORDINARY.**
- Supporting line: **DRIVEN BY CURIOSITY.**
- Greeting and intro are saved in Supabase public.sections, row slug=home, under content.intro:

> Hi, I’m Zihad — founder of Black Flash Hades. I’ve always been curious about how things work and what can be created beyond the familiar. That curiosity leads me to explore technology, build websites and applications, and experiment with creative digital projects. I learn by making things, testing ideas, and refining them through hands-on work. Each project gives me a new way to explore, solve problems, and keep building.

Preserved:
- Existing HADES identity/signature artwork
- Founder kicker
- “Explore selected work” CTA
- IDEAS / SYSTEMS / EXPERIENCES micro-label

Layout refinements:
- Improved heading scale, paragraph width/line height and spacing.
- Mobile/tablet reading order puts the text before the HADES signature artwork.
- Desktop retains a split composition.
- A 1024px headline/artwork collision found during QA was corrected by adjusting the responsive type scale.

### Media Library asset details modal — 2026-11-20

Previously completed and included in production:
- components/MediaShowcase.tsx renders the modal through a React portal under document.body, avoiding fixed-position errors inside transformed ancestors.
- Full-viewport overlay, responsive centered panel, internal panel scrolling and background scroll lock.
- Scrollbar compensation and cleanup/restoration of prior page styles.
- Initial focus, keyboard focus loop, Escape close, backdrop close and focus restoration.
- Preview/fallback/download behavior for images, video, audio, PDF and other downloadable assets.
- Accessible close label: Close asset preview.

Earlier QA for this modal included a 21/21 full Playwright run at the main fix checkpoint. The later close-label-only adjustment had focused modal tests plus lint, TypeScript and diff checks. The newer full 22/22 suite described below covers the subsequent regression baseline.

## 4. Latest verification evidence

After the final hero CSS adjustment, the following were run successfully on the local project:

| Check | Result |
|---|---|
| git diff --check | Passed |
| npm run lint | Passed; 0 lint failures |
| npx tsc --noEmit | Passed |
| npm run build | Passed |
| npm run test:e2e | **22/22 passed** |

The 22-test Playwright suite includes:
- Homepage and hero content assertions
- Hero composition at 390, 768, 1024 and 1440px
- Responsive overflow and layout checks
- Skills explorer interactions
- Theme behavior
- Motion/reveal behavior
- Media preview behavior
- Accessibility checks
- Contact form and API validation/security paths
- Admin unauthenticated sign-in gate

Production checks:
- Vercel deployment for the exact latest commit is **READY**.
- Production alias and unique deployment URL returned HTTP 200.
- Fresh live HTML confirmed the “Hi,” greeting, BEYOND THE ORDINARY headline and DRIVEN BY tagline.
- This verifies the deployed response and assets, but it is not the same as a full owner-authenticated interactive browser test of every production Admin/Storage workflow.

Do not claim tests not listed here were re-run in this release. Run the full suite again after any future code change. Run lint, type check, build and E2E serially; they share the .next output.

## 5. Product features and architecture

Technology:
- Next.js 15.5.29 App Router
- React 19
- TypeScript 5.9
- Supabase Postgres, Auth and Storage
- @supabase/ssr and @supabase/supabase-js
- Motion 14
- Lucide React
- Playwright and axe-core

Public website capabilities:
- Responsive portfolio homepage and section navigation
- Dark/light theme
- Hero, About, Selected Work, Expertise/Skills, Services, Creator Space, Experience, Education and Contact sections
- Media Archive when published media exists
- CMS-driven content rather than hardcoded owner content
- Blog route at /blog/[slug]
- Dynamic SEO metadata, robots.txt and sitemap.xml
- Contact form routed through a validated server endpoint

Admin/CMS capabilities:
- Supabase-authenticated Admin with an explicit public.user_roles admin-role check
- Content management for sections, projects, skills, experience, education, services, articles, videos, social links, testimonials, navigation, messages, media assets, settings and categories
- Branding/settings controls
- Supabase Storage media library

Key source paths:

| Path | Purpose |
|---|---|
| app/page.tsx | Public homepage composition |
| app/layout.tsx | Root layout and metadata |
| app/globals.css | Global visual system and responsive styles; inspect final cascade before editing |
| app/admin/page.tsx | Admin interface and CMS workflows |
| app/api/contact/route.ts | Contact submission endpoint |
| app/blog/[slug]/page.tsx | Article page |
| components/MediaShowcase.tsx | Public media archive and preview modal |
| components/ContactForm.tsx | Public contact form |
| components/MotionSurface.tsx | Pointer-based 3D interaction |
| components/Reveal.tsx | Scroll reveal |
| components/ThemeToggle.tsx | Theme control/persistence |
| lib/public-data.ts | Public Supabase data access |
| lib/admin-form.ts | Admin form parsing and validation |
| lib/supabase.ts | Browser Supabase client |
| tests/portfolio.spec.ts | Playwright regression tests |
| supabase/migrations/ | Local migration source files |
| supabase/legacy/README.md | Legacy migration warning |

## 6. Local setup and commands

Requirements: Node.js 20.9 or newer.

PowerShell setup:
1. Set-Location 'C:\Users\zihad\hades-portfolio'
2. npm ci
3. Copy-Item .env.example .env.local
4. Add the required values to .env.local locally.
5. Run npm run dev.

Environment variable names:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- NEXT_PUBLIC_SUPABASE_ANON_KEY — legacy fallback supported by code
- CONTACT_SUBMISSION_TOKEN — server-only secret; never expose it to the browser

Useful commands:
- npm run dev
- npm run lint
- npx tsc --noEmit
- npm run build
- npm run test:e2e
- npm audit --audit-level=low
- git diff --check

npm run dev is for development. Run the other checks before committing. Do not run multiple builds or Playwright runs concurrently.

## 7. Supabase: live project, security and migration cautions

Identifiers:
- Project ref: oxwadruhiavxftcglplx
- Organization ID: svelizeibygdshlcnvcu
- Plan: Free
- Last recorded project status: ACTIVE_HEALTHY

Verified security facts from the latest project audit:
- All 18/18 public tables had RLS enabled.
- Admin access requires Supabase Auth and an explicit public.user_roles row with role=admin.
- Storage bucket portfolio-media is public by design for portfolio media and has a 50 MiB upload limit. Never place private documents or sensitive files in it.
- Contact submission uses server-only CONTACT_SUBMISSION_TOKEN; a digest is stored in a private RLS-protected table and checked through a SECURITY DEFINER function.
- Direct public-key REST insert into the contact table was rejected; the server-routed valid contact path was verified in prior QA.
- Vercel rate limiting for POST /api/contact: 5 requests per IP per 600 seconds, deny after limit.
- Never expose a service-role key in client code or any NEXT_PUBLIC_* variable.

**Migration safety — critical:**
- Actual original remote baseline: 20261118154243_initial_portfolio_cms_schema.
- supabase/legacy/001_initial_schema.sql is an older/stale schema snapshot. Never replay it against production.
- Canonical SQL for the actual initial remote baseline is not mirrored in the active local migration directory.
- Do not run supabase db push, db reset, migration repair or destructive SQL until remote history and the canonical baseline have been reconciled. Never guess the production schema from the legacy file.

Plan limitations / advisor notes:
- Leaked Password Protection is disabled. It is plan-limited on the current Supabase Free plan (Pro+ feature); this is a known platform limitation, not a code fix.
- Two Performance Advisor INFO findings were recorded: admin_audit_logs_actor_id_idx and articles_category_id_idx (unused indexes). Do not remove them without workload evidence.
- Supabase Free does not include automatic database backups and low-activity projects may pause. An encrypted off-site backup and a successful restore drill remain outstanding.

Always check live table rows and project status before performing content CRUD. Old content counts in historical notes are snapshots, not permission to assume the current database state.

## 8. Hosting, deployment and Cloudflare experiment

### Current production: Vercel

- Project ID: prj_i0FEfGBdlXVHhiXkgwVnePBQdRi2
- Team ID: team_x9kagW1A3LvB4WCFqrhEMRsW
- Vercel Hobby plan
- GitHub main is connected to production auto-deploy.
- Exact-commit READY deployment was confirmed for 6af897f7f6e019133fbf557561cb0682a523f021.
- Only the Vercel subdomain is attached; no custom domain is configured.
- A non-blocking Vercel build warning has appeared: npm Unknown env config "cache-dir". It appears platform-injected; do not add a brittle project workaround.

**Commercial-use restriction:** Vercel Hobby terms restrict use to personal/non-commercial projects. This portfolio advertises services and accepts client enquiries, so resolve hosting-plan compliance before commercial/revenue-generating use. Do not upgrade, purchase or migrate without explicit owner approval.

### Separate Cloudflare evaluation

- Branch: cloudflare-free-evaluation
- Last recorded evaluation head: 54ef5d3
- Not merged into main; not production; no production DNS/host switch.
- Prior compatibility estimate: 96%, with partial next/image compatibility.
- A local evaluation browser suite passed 19/19 at that checkpoint; this is not live production migration evidence.
- Cloudflare auth was not connected and no Worker deployment was performed.

Do not mix this experimental branch into production. A migration would require a separate staging Worker and end-to-end checks for SSR, Auth, Admin, Storage, contact/API, secrets and CPU limits, followed by explicit owner approval.

## 9. Remaining work — real sign-off gates

These tasks are not complete merely because the public site builds or deploys:

1. **Owner-authenticated Admin CRUD:** The owner must use their own session to test real create, edit and delete operations, plus settings/social persistence. Do not ask for their password or OTP.
2. **Real Storage lifecycle:** The owner must test upload, replace and delete in the production Admin with a harmless test asset, then confirm the public view and cleanup.
3. **Recovery:** Set up an encrypted off-site Supabase backup and complete a restore test.
4. **Hosting compliance:** Decide on an appropriate plan/provider before using the portfolio commercially. No upgrade or migration without explicit approval.
5. **Real content:** Add only owner-approved projects, media, videos, articles or testimonials that genuinely exist. Do not invent credentials, client work, education details or endorsements.
6. **Optional custom domain:** Attach only after hosting choice; validate DNS and HTTPS.
7. **Live interaction pass:** Owner or authorized tester should exercise the production Media Archive modal and owner-only flows in a real browser.

The application code, production build, automated regression baseline and deployed public homepage are verified. **Do not describe the entire project as 100% production/commercial signed off** until the remaining operational gates are completed.

## 10. Safe Git and deployment workflow

Before editing:
- git status --short --branch
- git log -5 --oneline

After code changes, run serially:
- npm run lint
- npx tsc --noEmit
- npm run build
- npm run test:e2e
- git diff --check
- git status --short
- git diff --stat
- git diff

Then:
1. Review the actual diff and ensure no .env.local, secret, database dump, private media or unrelated user change is included.
2. Commit with a clear message.
3. Push to origin main only when production deployment is intended and the change is approved.
4. Verify Vercel built the exact pushed commit and state is READY.
5. Smoke-test /, /admin, /robots.txt and /sitemap.xml; exercise changed public flows and inspect browser/runtime errors where available.
6. Update this file in the same work session with the new commit, deployment ID/URL, tests actually run, results and remaining caveats.

Never force-push, reset production history or merge the Cloudflare evaluation branch without explicit task scope and review.

## 11. Non-negotiable project rules

- Respect the owner's free/no-spend preference. Never trigger paid upgrades, purchases or migrations without explicit approval.
- Never request or expose passwords, OTPs, service-role keys or secret values.
- Never commit .env.local, secrets, database dumps, private messages or sensitive media.
- Never fabricate work history, client projects, qualifications, education details, testimonials, articles or content.
- Preserve HADES identity, logo/monogram and owner-controlled social identities/assets unless explicitly asked to change them.
- Preserve existing functionality when editing; inspect the code and final CSS cascade before changing shared behavior.
- Never claim a check passed unless it was actually executed. Distinguish local tests, live HTTP checks and owner-authenticated production testing.
- Do not replay stale migrations or run destructive database operations blindly.
- Keep this file as the current operational truth after every substantial task.

## 12. Other repository documentation

- README.md — short public project overview and setup; points here for the full handover.
- docs/PROJECT_CONTEXT.md — chronological project history and older QA notes. Useful for historical rationale only. It contains dated snapshots that may be superseded; do not use it instead of this handover for current commit, deployment, data counts or status.

---
**End of canonical handover. Start every future session with this file and the Git status commands in Section 2.**
