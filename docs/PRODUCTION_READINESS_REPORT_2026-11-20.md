# HADES Portfolio — Production Readiness Report
**Report date:** 2026-11-20 (Asia/Dhaka)
**Repository:** https://github.com/mdzihadss509-del/Portfolio
**Production:** https://hades-portfolio-amber.vercel.app/
**Admin:** https://hades-portfolio-amber.vercel.app/admin

> This is the current operational report for continuing work. It supersedes older dated status snapshots in this repository. Read this report together with `docs/HANDOFF.md`; use the Git status and live platform state before making changes.

## Executive status

The public portfolio is live. The latest verified production release before this documentation-only report is commit `1f0ed4c827e479b9dba7b5caf9c50e799ee650d8`, deployment `dpl_DoyD1hc4K729drRbthmZpTyXUCAN`, state READY. The app passes its current local automated checks and public production smoke tests.

**Do not call the whole project 100% signed off.** Owner-authenticated production Admin CRUD, real Storage API upload/replace/delete, and an isolated restore rehearsal remain unverified. Hosting-plan commercial eligibility also remains an owner decision.

## 1. Project and platform identifiers

| Item | Value |
|---|---|
| Project | HADES Portfolio CMS |
| Repository | `mdzihadss509-del/Portfolio` |
| Production branch | `main` |
| Local checkout | `C:\Users\zihad\hades-portfolio` |
| Production URL | https://hades-portfolio-amber.vercel.app/ |
| Admin URL | https://hades-portfolio-amber.vercel.app/admin |
| Supabase project ref | `oxwadruhiavxftcglplx` |
| Supabase region / DB | `ap-south-1` / PostgreSQL 17.12 |
| Supabase plan | Free |
| Vercel project | `hades-portfolio` |
| Vercel plan | Hobby |
| Current local env names | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Secret handling | Never read, print, commit or send secret values; `.env.local` is private and ignored |

## 2. Latest verification performed in this session

All checks below were freshly run on the connected Windows machine at `C:\Users\zihad\hades-portfolio`. Commands were run serially because build and Playwright share generated output.

| Check | Command | Result |
|---|---|---|
| ESLint | `npm.cmd run lint` | PASS, exit 0 |
| TypeScript | `npx.cmd tsc --noEmit` | PASS, exit 0 |
| Dependency audit | `npm.cmd audit --audit-level=low` | PASS, 0 vulnerabilities |
| Production build | `npm.cmd run build` | PASS, Next.js 16.4.6 Turbopack |
| Playwright | `npm.cmd run test:e2e` | PASS, 23/23 in 40.5s |
| Git whitespace | `git diff --check` | PASS |
| Git state before report edits | `git status --short --branch` | Clean, `main` aligned with `origin/main` |

The 23 end-to-end tests covered:
1. Homepage, primary heading and navigation targets.
2. Skills explorer filtering, search and expansion.
3. Dark/light themes.
4. Responsive layouts and horizontal overflow.
5. Hero layout at desktop/mobile sizes.
6. Pointer-based hero 3D behavior and reduced-motion preference.
7. Reveal, entrance and hover animations.
8. Published media gallery and filters.
9. Media detail preview and backdrop/panel close.
10. Mobile modal viewport and background scroll lock.
11. No stale ISR response after CMS changes.
12. Production security headers.
13. Admin navigation URL safety.
14. SEO title/description and owner identity.
15. Favicon, robots and sitemap endpoints.
16. Accessibility scan in both themes (no serious/critical automated violations).
17. Contact form success interaction.
18. Contact API cross-origin rejection.
19. Contact API malformed/null/non-JSON body validation.
20. Contact API oversized payload and honeypot behavior.
21. Contact API fail-closed behavior when server-only token is absent.
22. Contact API POST-only method guard.
23. Admin sign-in gate and no public sign-up.

### Fresh production HTTP smoke test

| URL | Result | Interpretation |
|---|---:|---|
| `/` | 200 | Public homepage responds |
| `/admin` | 200 | Admin route responds; this is not authenticated CRUD proof |
| `/robots.txt` | 200 | Crawler rules served |
| `/sitemap.xml` | 200 | Sitemap served |
| `GET /api/contact` | 405 | Expected method guard |

Homepage and Admin responses included HSTS `max-age=31536000; includeSubDomains` and a Content-Security-Policy header. Homepage title observed: `Zihad | Creator &amp; Developer`.

### Important test boundary

Playwright tests ran against the local test environment. Production HTTP checks are unauthenticated smoke tests. No owner password, OTP or browser session was supplied or requested. Therefore, the following are **not** claimed as completed:
- Owner-signed-in production Admin create/edit/delete and settings persistence.
- Real production Storage upload, replacement and deletion via the Storage API.
- Full interactive owner workflow in the production browser.

A database-level admin-role CRUD test was previously executed in a rollback-only transaction; the temporary record was removed by rollback. A further rollback-only transaction was attempted in this session; the SQL connector surfaced the final DELETE result, not separate output rows for each CTE stage. Treat the earlier successful CRUD evidence as database-policy verification, not as a substitute for the owner browser test.

## 3. Supabase status and advisor findings

Fresh project check: `ACTIVE_HEALTHY`, PostgreSQL `17.12.0.000`, region `ap-south-1`.

| Advisor | Latest result |
|---|---|
| Health | No findings |
| Security | One WARN: `auth_leaked_password_protection` |
| Performance | Two INFO unused-index findings |

### Security warning

`Leaked Password Protection Disabled` remains. Current project is on Supabase Free; the feature is documented as available on Pro and above. Do not change plan or incur cost without explicit owner approval. This is a platform-plan limitation, not a code fix.

### Performance notices

- `public.admin_audit_logs_actor_id_idx`
- `public.articles_category_id_idx`

Both are INFO unused-index notices. Do not remove them without workload evidence.

### RLS and backend evidence

- Prior live audit found RLS enabled on all 18/18 public tables.
- Public reads expose intended published portfolio content.
- Anonymous writes to protected CMS content were rejected by RLS.
- Admin mutations require the admin-role check.
- Health Advisor has no findings.
- Storage bucket `portfolio-media` is public-read by design; upload/update/delete policies restrict operations to admin.
- Bucket limit recorded as 50 MiB. No MIME allow-list was configured in the previous audit; evaluate whether one is needed before accepting untrusted uploads.
- Contact submission token is server-only. Never expose service-role keys or private tokens in browser code or `NEXT_PUBLIC_*` variables.

No production schema migration or database DDL change was made in this work.

## 4. Storage / Media Library

Verified previously:
- Public read of an existing media object.
- Admin-only Storage policies in database metadata.
- Storage object metadata insert/update authorization tested inside a rollback-only transaction.
- Existing file HEAD request returned HTTP 200 and image/jpeg.

Not yet verified end-to-end:
- Upload a harmless test image through the signed-in production Admin UI.
- Replace/upsert an existing test asset.
- Delete the test asset through the UI/Storage API.
- Confirm the public gallery shows the replacement and then confirms cleanup.

Do not use real private documents or sensitive content in the public bucket. Use a disposable test asset and remove it after successful verification.

## 5. Backup and recovery

A content-and-media backup was created locally:

- Folder: `C:\Users\zihad\hades-portfolio-backups\HADES-Portfolio-backup-2026-11-20`
- ZIP: `C:\Users\zihad\hades-portfolio-backups\HADES-Portfolio-backup-2026-11-20.zip`
- ZIP size: 547,393 bytes
- SHA-256: `8356828EF64227D8F0328B0521DAE01E5A61D32E0E903D94CAEDD014A3078916`
- 15/15 CMS tables exported.
- 4/4 Storage binaries downloaded.
- 8 ZIP entries verified after extraction; byte sizes and checksums matched.

The backup includes CMS content JSON, Storage checksums, manifest, restore notes, and four media binaries. It intentionally excludes authentication users, role assignments, audit logs, contact messages, private contact secrets and all credentials. It is **not** a complete database/PITR backup.

**Restore rehearsal is not done.** The canonical initial migration SQL for remote migration `20261118154243_initial_portfolio_cms_schema` is not mirrored in the active local migration directory. `supabase/legacy/001_initial_schema.sql` is stale and its README prohibits replay. Never run `supabase db reset`, `supabase db push`, migration repair, or guessed DDL against production until the canonical baseline and remote history are reconciled.

Supabase Free does not provide scheduled automated DB backups/PITR. Keep the local backup safe and create an encrypted off-site backup before any recovery drill.

## 6. Hosting and deployment

Latest verified production deployment before this docs-only report:
- Deployment ID: `dpl_DoyD1hc4K729drRbthmZpTyXUCAN`
- State: READY
- Production alias: https://hades-portfolio-amber.vercel.app/
- Unique deployment: https://hades-portfolio-bk82mgjt9-mdzihadss509-1195.vercel.app
- Source commit: `1f0ed4c827e479b9dba7b5caf9c50e799ee650d8`
- Inspector: https://vercel.com/mdzihadss509-1195/hades-portfolio/DoyD1hc4K729drRbthmZpTyXUCAN

The documentation commit that adds this report may trigger a fresh Vercel deployment through Git integration. After pushing, check the deployment and confirm the exact commit is READY before reporting that deployment as verified.

Known platform caveats:
- Vercel Hobby commercial-use eligibility must be checked before monetized/business use. Do not upgrade or migrate without approval.
- No custom domain is configured.
- Vercel build environment has previously emitted non-blocking `npm warn Unknown env config "cache-dir"`; no brittle workaround was added.
- A previous 24-hour Vercel runtime-error check was clean; refresh after new deployments.

## 7. Known remaining work — do not mark complete prematurely

### Owner-session gates
1. Sign into production Admin using the owner's own browser session.
2. Create, edit and delete one harmless CMS test record; verify it persists after reload and clean it up.
3. Change a reversible setting/social field only if owner approves; verify persistence and restore original value if it is a test.
4. Upload a harmless image, replace it, verify public display, delete it, verify cleanup.
5. Exercise the production Media Archive modal in a real browser on desktop and mobile.

No password or OTP is needed in chat. If the authorized browser session is not accessible to the assistant, the owner must complete that browser-only step; never pretend it was tested.

### Recovery and hosting gates
6. Recover/reconcile canonical migration baseline safely.
7. Create encrypted off-site backup.
8. Perform restore rehearsal in an isolated non-production environment.
9. Confirm Vercel Hobby terms fit intended use, or obtain explicit approval before paid plan/host changes.
10. Attach a custom domain only if requested and after hosting decision.

## 8. Safe continuation instructions

Start next session with:
```powershell
Set-Location 'C:\Users\zihad\hades-portfolio'
git status --short --branch
git log -5 --oneline --decorate
git rev-parse HEAD
git rev-parse origin/main
```

Then:
1. Read this report and `docs/HANDOFF.md`.
2. Verify live Vercel deployment and Supabase status; do not assume dated IDs remain current.
3. Preserve unexplained local changes. Never reset, clean, stash or force-push.
4. Before any Supabase task, read the installed Supabase skill and current official docs.
5. Never run stale migrations or destructive production SQL.
6. Never read/print secrets; do not commit `.env.local`, dumps, private media or customer data.
7. Run lint, typecheck, audit, build and E2E serially after code changes.
8. Update this report with exact commands, actual results, commit SHA, deployment ID/state and outstanding blockers.
9. Distinguish local automated tests, live unauthenticated HTTP checks, database transaction tests, and owner-authenticated browser tests.

## 9. Application architecture quick reference

- Next.js 16.4.6 App Router / Turbopack
- React 19, TypeScript 5.9
- Supabase Postgres, Auth, Storage
- `@supabase/ssr 0.12.7`, `@supabase/supabase-js 2.119.2`
- Playwright + axe-core
- Main paths: `app/page.tsx`, `app/admin/page.tsx`, `app/api/contact/route.ts`, `components/MediaShowcase.tsx`, `components/ContactForm.tsx`, `lib/public-data.ts`, `lib/admin-form.ts`, `tests/portfolio.spec.ts`, `supabase/migrations/`.
- Main operational handover: `docs/HANDOFF.md`.

---
**End of report. This report records what was actually verified and deliberately keeps owner-only and platform-limited work open.**
