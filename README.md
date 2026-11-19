# HADES Portfolio

A personal portfolio and content-management system built with **Next.js 15, React 19, TypeScript, and Supabase**.

The project includes a responsive portfolio website, a protected Admin workspace, editable CMS sections, social links, a blog, YouTube embeds, a public Media Archive, and a contact form.

## Quick start

Requirements: Node.js 20.9 or newer and an existing Supabase project.

```bash
npm ci
cp .env.example .env.local
```

Set these values in `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Then run:

```bash
npm run dev
```

Open:

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin

Never commit `.env.local`, service-role keys, passwords, access tokens, or other secrets.

## Main capabilities

- Dynamic portfolio sections backed by Supabase.
- Admin sign-in through Supabase Auth and an explicit `user_roles.role = 'admin'` record.
- CMS modules for sections, projects, skills, experience, education, services, articles, videos, social links, testimonials, navigation, messages, media assets, site settings, and categories.
- Branding controls for logo, favicon, SEO and site details.
- Media Library uploads (up to 50 MB) and public Media Archive cards for images, video, audio, documents, archives, and other files.
- Dark/light themes, responsive layouts, motion reveals, and pointer-based 3D surfaces.
- Contact form API with validation, honeypot field, and basic in-memory request limiting.
- Individual published article pages at `/blog/[slug]`.

## Useful commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run test:e2e
npm run build
npm start
```

## Supabase setup

SQL migrations are in `supabase/migrations/`.

1. Apply `001_initial_schema.sql` only when setting up a new database.
2. Configure the public Storage bucket named `portfolio-media` and its upload/delete policies for the intended Admin role.
3. Create the first Supabase Auth account and insert its user ID into `public.user_roles` with role `admin`.
4. Disable public signups after creating the administrator.
5. Configure Supabase Auth password protections and review the security notes in `PROJECT_CONTEXT.md`.

The existing connected database already has the schema and the media-assets public-read policy applied. Do not re-run migrations blindly against that database.

## Project handover

**Read [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) before changing this project.** It records the architecture, current database state, working checks, confirmed defects, pending work, and continuation instructions.

## Current verification status

The latest local checks recorded in the handover document are:

- Production build: passed.
- TypeScript: passed.
- ESLint: 0 errors, 18 warnings.
- Playwright: 6 passed, 1 failed. The remaining failure is the strict theme-background test; the actual light/dark surface mismatches are documented in `PROJECT_CONTEXT.md`.

No production deployment has been performed.
