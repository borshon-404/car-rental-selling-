# Daulat CMS

Admin and public site for Daulat Drive. Pages, posts, products, portfolio, header, footer, media, SEO, Google Analytics, Search Console, and SMTP are edited from one panel. The static brochure at the workspace root is a separate site and is not overwritten by this app.

Production uses Postgres. See `../VERCEL.md` for the Vercel project (Root Directory must be `cms`).

## Local setup

```bash
cd cms
cp .env.example .env
# Put two different 32+ character secrets in AUTH_SECRET and SETTINGS_SECRET.
npm ci
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000 for the public site and http://localhost:3000/admin/login for the panel.

Seeded temporary admin (change it on first login):

- email: `admin@example.com`
- password: value of `ADMIN_TEMP_PASSWORD` (example: `ChangeMe!2026`)

The first login is sent to `/admin/change-password`. The temporary password cannot be reused. Until that change is saved, every other admin API returns 403.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js on `0.0.0.0:3000` |
| `npm run build` | `prisma generate` and production build |
| `npm run start` | Production server |
| `npm run lint` | `tsc --noEmit` |
| `npm run db:push` | Create or update tables |
| `npm run db:seed` | Temporary admin plus sample content. Resets that admin's password and forces a change again. |
| `npm run db:reset` | Drop local tables, push, seed |
| `npm run create-admin` | `ADMIN_EMAIL` and `ADMIN_TEMP_PASSWORD` (12+ characters). `ADMIN_ROLE=editor` creates an editor. |

## Production database

`prisma/schema.prisma` uses PostgreSQL. Set `DATABASE_URL` to a non-pooling Postgres URL (Vercel Postgres, Neon, or Supabase). The Vercel build script creates tables and seeds the admin only if that email does not exist yet.

## Deploy

Recommended: a GitHub repo whose root is this `cms` folder, or a monorepo with Vercel **Root Directory** set to `cms`.

Vercel project settings:

- Framework: Next.js
- Install: `npm ci`
- Build: `npx prisma generate && npx prisma db push && next build`
- Node: 20

Set every name in `.env.example` in the Vercel environment. Do not commit `.env`. After the first deploy, sign in and replace the temporary password. Uploads on Vercel require Cloudinary. The serverless disk cannot keep `public/uploads`.

GitHub Actions:

- `cms/.github/workflows/ci.yml` if this folder is the repository root
- `.github/workflows/cms.yml` if the repository also contains the static brochure

## What to edit

| Public URL | Admin |
| --- | --- |
| `/` | Pages, slug `home` |
| `/p/[slug]` | Pages |
| `/blog`, `/blog/[slug]` | Posts |
| `/products`, `/products/[slug]` | Products (price entered in BDT) |
| `/portfolio`, `/portfolio/[slug]` | Portfolio |
| Header and footer | Header & footer (JSON) |
| `/sitemap.xml`, `/robots.txt` | SEO & SMTP, plus each item's robots field |
| `/admin` | Dashboard |

Body fields are a small Markdown subset (headings, lists, bold, links, code). HTML typed into the body is escaped, so it cannot run script.

Full design notes, security rules, and acceptance checks are in `SPEC.md`.
