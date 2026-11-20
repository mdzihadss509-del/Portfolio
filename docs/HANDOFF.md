# HADES Portfolio — Canonical Project Handover

**Last updated:** 2026-11-20  
**Purpose:** This is the first document to read when resuming work in a new chat/session. It is the current operational snapshot. For deeper historical details, read `PROJECT_CONTEXT.md`. If older notes conflict with this handover, prefer this file and verify the live systems before acting.

## 1. Project identity and canonical locations

- Project: HADES Portfolio CMS
- Owner/brand: Zihad / HADES / Black Flash Hades
- GitHub: https://github.com/mdzihadss509-del/Portfolio
- Production branch: `main`
- Local Windows checkout: `C:\Users\zihad\hades-portfolio`
- Production website: https://hades-portfolio-amber.vercel.app/
- Production Admin: https://hades-portfolio-amber.vercel.app/admin
- Local website: http://localhost:3000/
- Local Admin: http://localhost:3000/admin
- Git remote: `origin = https://github.com/mdzihadss509-del/Portfolio.git`
- Current local state at handover: `main` clean and aligned with `origin/main`, HEAD `0be7065`.

**Do not confuse this repository with the Cloudflare experiment branch.** Production remains on Vercel. The Cloudflare evaluation is a separate, unmerged branch described below.

## 2. Current Git state and latest production code

Production branch commit history (newest first):
- `0be7065` — Use generic close label for asset preview
- `461a8af` — Fix media asset preview modal positioning and scroll
- `4303d80` — Document production QA and test skills explorer
- `f3387eb` — Redesign skills expertise explorer
- `b5bdd9b` — Expand portfolio identity and section navigation

Latest modal fix is already committed and pushed to `main`; it is not an uncommitted local-only change.

### Latest live production deployment

- Vercel deployment ID: `dpl_HpJRmNrStnCj3Pfk6btTtqDNiZhv`
- Source commit: `0be7065e9ddd0c2baeb456aa95c2595d89ff0a8f`
- Target/state: Production / READY
- Alias: `hades-portfolio-amber.vercel.app`
- Alias error: none
- Live homepage and Admin HTTP checks: 200.
- Live robots.txt and sitemap.xml: 200.
- Live CSS and JS chunks: 200; fetched bundle includes the new asset-preview modal code and accessible close label.
- Vercel runtime error scan at deployment verification: zero errors in the inspected last hour.

Always re-check Vercel's current deployment state before assuming this historical status is still current.

## 3. Current website contents and behavior

Public sections:
- Hero / HADES identity
- About
- Selected Work
- Expertise / Skills Explorer
- Services
- Creator Space
- Experience
- Education
- Contact
- Media Archive when published media exists

Current portfolio content:
- Projects: 4
  1. HADES Portfolio
  2. Black Flash - Hades
  3. Minecraft Server & Plugin Experiments
  4. AI-assisted Video Workflow
- Skills: 29, with category filtering, text search and expand-all interaction; CMS additions should appear without frontend hardcoding.
- Services: 6
  - Web & App Development
  - Gaming & Minecraft Projects
  - Design & Visual Creation
  - Video Editing & Content Creation
  - Digital Project Management
  - Creative & Technical Collaboration
- Experience: 1 — Founder & Creator, Black Flash Hades. Do not present this as formal employment.
- Education: 1 — ongoing college education; institution/qualification has not been supplied. Do not invent them.
- Social/contact links: YouTube, Discord, Facebook, GitHub, email, Instagram.
- Blog article records: 0.
- YouTube video records: 0.
- Testimonials: 0.
- Media assets: latest owner test upload recorded 1 image asset titled `test` (229.3 KB JPG); verify current count before changing/deleting anything.
- Do not fabricate client work, qualifications, testimonials, articles, video records or media.

## 4. Recent UI fix — Media Library asset details modal

Files changed:
- `components/MediaShowcase.tsx`
- `app/globals.css`
- `tests/portfolio.spec.ts`
- `docs/PROJECT_CONTEXT.md`

Behavior:
- Modal is rendered with React portal under `document.body`, avoiding incorrect fixed positioning inside transformed/animated ancestors.
- Full-viewport overlay, centered responsive modal, internal content scrolling and background page scroll lock.
- Scrollbar compensation and restoration of previous root/body styles on close.
- Initial focus, keyboard Tab/Shift+Tab loop, Escape close, backdrop close, and return focus to the opener.
- Handles image/video/audio/PDF and other downloadable asset types with fallback/download behavior.
- Generic accessible close label: `Close asset preview`.

QA evidence:
- Full Playwright run at the main modal-fix checkpoint: 21/21 passed.
- After the final tiny accessible-label adjustment, lint, TypeScript, focused modal E2E checks and `git diff --check` were rerun successfully. The full suite was not rerun after that final label-only adjustment; do not state otherwise.
- Production deployment for the latest commit is READY.
- Live homepage, modal CSS and JS assets were fetched successfully. **A real interactive browser session against the live published asset modal was not performed**; local Playwright regression coverage is the interaction evidence.

## 5. Technology, architecture and key files

- Next.js 15.5.29 App Router
- React 19
- TypeScript 5.9
- Supabase Postgres, Auth and Storage
- Motion 14, Lucide React
- Playwright and axe-core

Important paths:
- `app/page.tsx` — public homepage composition
- `app/layout.tsx` — root layout and metadata
- `app/globals.css` — global design system/styles; large stylesheet with historical overrides, inspect cascade before editing
- `app/admin/page.tsx` — protected CMS/admin interface and CRUD/upload logic
- `app/api/contact/route.ts` — hardened contact endpoint
- `app/blog/[slug]/page.tsx` — published article route
- `components/MediaShowcase.tsx` — public media archive and detail modal
- `components/ContactForm.tsx` — public contact form
- `components/MotionSurface.tsx` — pointer-based 3D tilt
- `components/Reveal.tsx` — scroll reveal
- `components/ThemeToggle.tsx` — theme persistence
- `lib/public-data.ts` — public Supabase data access
- `lib/admin-form.ts` — Admin form parsing/validation
- `lib/supabase.ts` — browser Supabase client
- `tests/portfolio.spec.ts` — Playwright regression suite
- `supabase/migrations/` — current migration source files
- `supabase/legacy/README.md` — important warning about legacy migration history
- `docs/PROJECT_CONTEXT.md` — full detailed chronological project record

## 6. Local setup and safe commands

Requirements: Node.js 20.9+.

PowerShell:
```powershell
Set-Location 'C:\Users\zihad\hades-portfolio'
npm ci
Copy-Item .env.example .env.local
# Fill only the required environment values locally, never commit .env.local.
npm run dev
```

Environment variable names:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Legacy fallback supported by code: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CONTACT_SUBMISSION_TOKEN` — server-only secret; never prefix with NEXT_PUBLIC and never publish its value.

Useful commands:
```powershell
git status --short --branch
git log -5 --oneline --decorate
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
npm audit --audit-level=low
git diff --check
```

Run build and Playwright serially; do not run multiple Next.js builds/tests simultaneously because they share `.next` output.

## 7. Supabase project and critical security notes

- Supabase project ref: `oxwadruhiavxftcglplx`
- Organization ID: `svelizeibygdshlcnvcu`
- Plan: Free
- Status at last check: ACTIVE_HEALTHY
- 18/18 public tables have RLS enabled.
- Public Storage bucket: `portfolio-media`, 50 MiB upload limit; public URL access is intentional for portfolio assets. Never upload private/sensitive documents.
- Admin access requires Supabase Auth plus explicit `public.user_roles` row with `role='admin'`.
- No public Admin signup/default password is exposed.
- Contact API uses a server-only `CONTACT_SUBMISSION_TOKEN`; its digest is held in a private RLS-protected table and checked by a SECURITY DEFINER function. Direct client insert using only the public key was verified rejected (401/42501); valid server-routed contact submission was verified 200; QA contact rows were cleaned.
- Vercel firewall rate limit: POST `/api/contact`, per-IP fixed window, 5 requests / 600 seconds, deny.
- Never expose service-role key in browser or any `NEXT_PUBLIC_*` variable.
- Never ask the owner for password or OTP; owner-only tests should be completed by the owner in their own authenticated session.

Migration caution:
- The original connected Supabase baseline is `20261118154243_initial_portfolio_cms_schema`.
- `supabase/legacy/001_initial_schema.sql` is a stale earlier schema snapshot and must never be replayed.
- The canonical SQL for the actual original baseline is not mirrored in the active local migrations directory.
- Do not run `supabase db push`, `db reset`, migration repair or destructive SQL until remote migration history and canonical baseline are reconciled. No blind schema changes.

Supabase plan limitations:
- Leaked Password Protection is disabled; Supabase Free does not provide this feature (Pro+). This is a known plan-limited warning, not an app-code failure.
- Performance Advisor has two INFO unused indexes: `admin_audit_logs_actor_id_idx`, `articles_category_id_idx`; retain pending workload evidence.
- Free projects may pause after a week of low activity and do not include automatic database backups. Encrypted off-site backup and a restore test remain outstanding.

## 8. Hosting, deployment and separate Cloudflare experiment

Production:
- Vercel project ID: `prj_i0FEfGBdlXVHhiXkgwVnePBQdRi2`
- Vercel team ID: `team_x9kagW1A3LvB4WCFqrhEMRsW`
- Current production host: Vercel Hobby.
- GitHub `main` auto-deploys to Vercel; exact-commit READY verification has been performed.
- Vercel Hobby terms restrict use to personal/non-commercial projects. This portfolio advertises services and invites client enquiries; resolve plan/provider compliance before commercial/revenue-generating use. Do not upgrade or migrate without explicit owner approval.
- Current domain is only `hades-portfolio-amber.vercel.app`; no custom domain is attached.
- Known non-blocking Vercel build warning: npm `Unknown env config "cache-dir"`; observed as platform-injected. Do not add a fragile workaround.

Cloudflare experiment:
- Branch: `cloudflare-free-evaluation`
- Last recorded head: `54ef5d3`
- It is a separate evaluation branch and is **not merged into main or production**.
- Cloudflare auth was not connected; no Worker deployment, DNS change or production switch was performed.
- vinext compatibility estimate was 96%, with partial `next/image` compatibility.
- Cloudflare Workers Free limit noted: 100,000 requests/day and 10 ms CPU per invocation; SSR/auth/admin paths may exceed it and have not been proven on live staging.
- Local evaluation checks passed 19/19 browser tests; preview had a separate 19-test run (test-only fixture excluded). This is not production migration evidence.
- Before any migration: deploy a separate staging Worker, configure secrets safely, test SSR/auth/Admin/storage/contact/API and CPU usage, compare behavior, obtain owner approval, and only then plan domain/DNS switch. Never merge or switch based solely on compatibility percentage.

## 9. Current quality status — honest, not a 100% claim

Previously verified:
- ESLint: 0 warnings/errors.
- TypeScript: passed.
- Next.js production build: passed.
- npm audit: 0 vulnerabilities.
- git diff --check: passed.
- Playwright: 21/21 at the full modal-fix checkpoint; focused modal tests passed after the final close-label adjustment.
- Production deployment READY and live HTTP/CSS/JS smoke checks passed.
- Earlier production QA covered responsive widths 320/390/768/1024/1440, dark/light themes, axe serious/critical scans, navigation, contact validation and Admin unauthenticated gate.

Still outstanding / not verified:
1. Owner-authenticated real Admin create/edit/delete and settings/social persistence.
2. Real Storage upload/replace/delete lifecycle using the owner account.
3. Populate only genuine owner-approved blog/video/testimonial/media content where wanted.
4. Hosting-plan compliance for intended commercial use.
5. Encrypted off-site Supabase backup and successful restore drill.
6. Optional custom domain and DNS/HTTPS validation.
7. Real interactive live-browser check of the latest asset modal on the production site.
8. Re-run the complete E2E suite after any future code change; latest full suite preceded the final label-only adjustment.

Do not call the site 100% production-ready until relevant operational gates are closed. A rough earlier estimate was ~90%, not a measured score.

## 10. First actions when resuming this project

1. Read this file and `docs/PROJECT_CONTEXT.md` (especially migration history and latest chronological notes).
2. Confirm the connected Desktop Commander device is online if local execution is required.
3. Check `git status --short --branch`, current branch, HEAD, remotes and latest commits.
4. Confirm whether the task is for production `main` or the isolated `cloudflare-free-evaluation` branch. Never mix them.
5. Inspect the actual current code and live system before changing anything; historical notes are not proof of current state.
6. Do not overwrite uncommitted owner changes. Create a feature branch for substantial work, run checks, review diff, commit and push deliberately.
7. After pushing `main`, verify Vercel deployed the exact commit and is READY, then run live smoke checks.
8. Update this handover and `PROJECT_CONTEXT.md` after substantial changes, recording exact commit/deployment IDs, tests run, tests not run, known failures and remaining work.

## 11. Non-negotiable safety and product rules

- Free-tier/no-spend preference: never trigger paid upgrades, purchases, or migrations with costs without explicit approval.
- Never request, store or commit passwords, OTPs, service-role keys or secret values.
- Never commit `.env.local`, database dumps, private messages or sensitive media.
- Never fabricate portfolio credentials, work, testimonials or customer stories.
- Never replay stale/legacy migrations against production.
- Never report a test as passed unless it was actually run; distinguish local browser tests from live production checks.
- Preserve existing HADES brand and owner-controlled social account identities/assets unless explicitly asked to change them.

---
**End of canonical handover. Update this file after the next meaningful change.**


## 12. 2026-11-20 — Hero identity, copy and responsive composition refresh

- Updated the public Home/Hero content in Supabase `sections` for slug `home`; restored the requested greeting and a fuller owner-authored first-person intro:
  "Hi, I’m Zihad — founder of Black Flash Hades. I’ve always been curious about how things work and what can be created beyond the familiar. That curiosity leads me to explore technology, build websites and applications, and experiment with creative digital projects. I learn by making things, testing ideas, and refining them through hands-on work. Each project gives me a new way to explore, solve problems, and keep building."
- Changed the visual hero headline to `ZIHAD / BEYOND THE ORDINARY.` and added `DRIVEN BY CURIOSITY.` as a supporting positioning line.
- Preserved the existing founder kicker, Explore selected work CTA and `IDEAS / SYSTEMS / EXPERIENCES` micro-label.
- Refined headline, intro, spacing and type sizing. Mobile/tablet reading order is copy first and HADES signature mark second; desktop retains the split composition. Adjusted tablet breakpoint and headline scale to avoid collision with the signature artwork.
- Updated `tests/portfolio.spec.ts` with hero copy and responsive-composition assertions.
- Verification after final CSS refinement: `git diff --check` passed; `npm run lint` passed; `npx tsc --noEmit` passed; `npm run build` passed; full Playwright suite **22/22 passed**. Tests cover 390, 768, 1024 and 1440px hero composition plus existing homepage, themes, motion, media, contact, security and Admin gate.
- Before code commit/push, these code changes were local to `main`; verify current Git state and Vercel production deployment before claiming they are live. Supabase Hero copy was already saved and verified through the passing homepage tests.
