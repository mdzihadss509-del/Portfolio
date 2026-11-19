# HADES Portfolio CMS

A personal portfolio and content-management system built with **Next.js 15, React 19, TypeScript, and Supabase**.

The project includes a responsive portfolio website, protected Admin workspace, editable CMS sections, social links, blog, YouTube embeds, public Media Archive, and contact form.

## Local setup

Requirements: Node.js 20.9 or newer and an existing Supabase project.

```bash
npm ci
cp .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local`, then run `npm run dev`.

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin

## Main commands

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run test:e2e
npm run build
npm start
```

## Main capabilities

- Dynamic portfolio sections and navigation backed by Supabase.
- Admin sign-in through Supabase Auth and `user_roles`.
- CMS for sections, projects, skills, experience, education, services, articles, videos, social links, testimonials, navigation, messages, media assets, site settings and categories.
- Branding controls, media library, responsive layouts, themes and motion interactions.
- Contact form API and published article pages at `/blog/[slug]`.

## Design acceptance criteria

- Dark theme: pure black page background (`#000000`), white text, **no neon/glow**, luminous shadows, or colored section fills.
- Light theme: pure white page background (`#ffffff`), dark text, **no neon/glow**, luminous shadows, or colored section fills.
- Keep surfaces neutral and readable; avoid gradients that tint large page sections.

## Project handover

Read [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) before continuing development. It records architecture, current implementation, known gaps, test history and next tasks. Features must be verified before being marked complete.

## Security

Never commit `.env.local`, service-role keys, tokens, passwords, database dumps or private media. `.env.example` contains placeholders only.

No production deployment is implied by this repository update.
