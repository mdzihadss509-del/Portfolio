# HADES Portfolio CMS

A personal portfolio and content-management system built with **Next.js 15, React 19, TypeScript and Supabase**.

**Live website:** https://hades-portfolio-amber.vercel.app/
**Admin:** https://hades-portfolio-amber.vercel.app/admin
**GitHub:** https://github.com/mdzihadss509-del/Portfolio

## Start here

For future development sessions, read **[docs/HANDOFF.md](docs/HANDOFF.md)** first. It is the single current source of truth for:

- Exact Git branch, latest commit and production deployment
- Live and local project URLs and connected service identifiers
- Setup instructions, environment variable names and useful commands
- Project architecture, source-file map and CMS capabilities
- Latest completed work and verified test results
- Supabase security rules and critical migration warnings
- Hosting constraints, known limitations and remaining sign-off tasks
- Safe Git, test and deployment workflow

**[Open the complete project handover](docs/HANDOFF.md)**

docs/PROJECT_CONTEXT.md is retained as a chronological historical record. Its older snapshots may be superseded; use the canonical handover for current operational state.

## Local setup

Requirements: Node.js 20.9 or newer and access to the configured Supabase project.

PowerShell:
1. npm ci
2. Copy-Item .env.example .env.local
3. Set the required values in .env.local
4. npm run dev

Local website: http://localhost:3000/
Local Admin: http://localhost:3000/admin

## Main commands

- npm run dev
- npm run lint
- npx tsc --noEmit
- npm run build
- npm run test:e2e
- npm audit --audit-level=low
- git diff --check

## Security

Never commit .env.local, Supabase service-role keys, contact tokens, passwords, OTPs, database dumps or private media. Do not replay stale/legacy Supabase migrations against the connected production database. Review docs/HANDOFF.md before database, auth, hosting or deployment changes.
