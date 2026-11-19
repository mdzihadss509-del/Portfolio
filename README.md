# HADES Portfolio CMS

A personal portfolio and content-management system built with **Next.js 15, React 19, TypeScript and Supabase**.

The public website is live at **https://hades-portfolio-amber.vercel.app**. The protected Admin workspace is at **https://hades-portfolio-amber.vercel.app/admin**.

The current code, public-site regression suite and production deployment are verified. Full operational sign-off is still conditional on owner-authenticated Admin/media workflows, real portfolio content, data-recovery arrangements and choosing a hosting plan that matches the website's intended use.

## Local setup

Requirements: Node.js 20.9 or newer and an existing Supabase project.

```bash
npm ci
copy .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`, then run `npm run dev`.

- Local website: http://localhost:3000
- Local Admin: http://localhost:3000/admin

## Main commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run test:e2e
npm run build
npm start
npm audit
```

## Main capabilities

- Responsive portfolio sections, navigation and theme toggle.
- Supabase Auth-protected Admin workspace with an explicit Admin-role check.
- CMS for sections, projects, skills, experience, education, services, articles, videos, social links, testimonials, navigation, messages, media assets, site settings and categories.
- Branding/settings editor and Supabase Storage media library (50 MB per upload).
- Published article pages at `/blog/[slug]`, dynamic SEO metadata, `robots.txt` and `sitemap.xml`.
- Contact form with origin/content-type/JSON validation, a streaming 16 KB request cap, honeypot, and shared edge rate limiting on the current Vercel deployment.
- Security headers: `nosniff`, frame denial, strict-origin referrer policy, restricted browser permissions and CSP `frame-ancestors 'none'`.
- Reduced-motion support, keyboard-aware interactions and dark/light theme accessibility regression.

## Latest local verification

- ESLint: **0 warnings / errors**.
- TypeScript: **passed**.
- Next.js production build: **passed**.
- Playwright: **18 tests** (see the latest full run in `docs/PROJECT_CONTEXT.md`).
- npm dependency audit: **0 vulnerabilities** at the last full audit.
- `git diff --check`: **passed**.

## Production and operational constraints

### Hosting plan

The live deployment is on Vercel Hobby. Vercel's current Terms restrict Hobby to personal or non-commercial use. This portfolio's documented purpose includes attracting freelance/client enquiries; using it for financial gain would therefore require a suitable commercial hosting plan or moving to a provider whose Free plan explicitly permits commercial projects. Do not treat a successful READY deployment as proof of plan-policy compliance.

Netlify currently documents commercial use on its Free plan and full Next.js App Router/SSR support. A migration would still require connecting the repository to the owner's Netlify account, configuring the two public Supabase environment variables, recreating the contact rate-limit rule and verifying a preview before changing the production domain. The current Vercel deployment is intentionally left live.

### Supabase Free plan

- Leaked Password Protection is a Pro+ Auth feature. It remains disabled on the current Free project and appears as the single Security Advisor warning.
- Free projects can pause after a week of low activity.
- Free projects do not include automatic database backups. Arrange and test an encrypted off-site database export before relying on the site for business enquiries or important content.
- The Performance Advisor reports two INFO unused indexes. They are retained until real workload evidence justifies a change; Health Advisor reports no findings.

### Owner-only verification

A site owner must sign in to the production Admin workspace to verify a real create/edit/delete cycle, branding/social setting persistence, and safe sample upload/replace/delete in Storage. Automated tests intentionally do not impersonate the owner or write artificial portfolio/contact content.

The live database currently has 6 sections, 4 navigation items and 1 social link, but no projects, skills, experience, articles, testimonials or published media assets. Populate these with real owner-approved content before treating the portfolio as ready to represent the owner's work. No sample or invented content is inserted by this repository.

### Domain

Only the Vercel subdomain `hades-portfolio-amber.vercel.app` is currently attached. Add an owner-controlled custom domain and verify its DNS/HTTPS after the hosting-plan choice is settled.

## Design acceptance criteria

- Dark theme: pure black page background (`#000000`), white text, restrained purple/red accents and no neon/glow effects.
- Light theme: pure white page background (`#ffffff`), dark text, restrained blue/red accents and no neon/glow effects.
- Preserve the HADES logo/monogram, typography, content and existing layout while improving accessibility and motion.

## Project handover and security

Read [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) before continuing development. It records architecture, connected project identifiers, migration history, verification and known blockers.

Never commit `.env.local`, service-role keys, tokens, passwords, database dumps, private media or contact-message exports. `.env.example` contains placeholders only. Never expose a Supabase service-role key in a `NEXT_PUBLIC_*` variable.

Run the build, type check and E2E suite serially to avoid concurrent writes to Next.js `.next` output. Do not replay the original bootstrap migrations against the connected production database: its live migration history differs from the early local bootstrap files.

## Deployment workflow

GitHub `main` is linked to the current Vercel project and push-to-production auto-deploy has been verified. Before merging a production change, run:

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm run build`
4. `npm run test:e2e`
5. `npm audit --audit-level=low`

After deployment, verify the exact commit is READY, then smoke-test `/`, `/admin`, `/robots.txt`, `/sitemap.xml`, contact validation and the public browser console. Never mark owner-only Admin flows complete without a real owner-authenticated test.
