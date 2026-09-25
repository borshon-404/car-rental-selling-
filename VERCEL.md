# Deploy the admin panel on Vercel

The real login is the Next.js app in `cms/`, not `admin.html`. `admin.html` is only a static desk board.

## 1. Import this repository

In Vercel: Add New → Project → `borshon-404/car-rental-selling-`.

Set **Root Directory** to `cms`. If you leave it as the repository root, Vercel publishes the static brochure and `/admin/login` will not exist.

## 2. Create Postgres

Add a database from the Vercel project (Storage → Postgres) or paste a Neon/Supabase URL.

Copy the **non-pooling** connection string into `DATABASE_URL`. A pooled PgBouncer URL often makes `prisma db push` fail.

## 3. Environment variables

Set these on the Vercel project before the first deploy. Do not commit the values.

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Non-pooling Postgres URL |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `SETTINGS_SECRET` | A different `openssl rand -base64 32` |
| `ADMIN_EMAIL` | The email you will type on the login screen |
| `ADMIN_TEMP_PASSWORD` | At least 12 characters. Not the example from `.env.example` — this repo is public. |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` (update after you know the domain) |

Optional later: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Uploads fail on Vercel until those are set.

## 4. Deploy

Framework preset: Next.js. The app uses the `vercel-build` script, which creates tables, seeds the admin only if that email does not exist yet, then builds. Later deploys do not reset your password.

## 5. Log in

Open `https://your-project.vercel.app/admin/login`.

Use `ADMIN_EMAIL` and `ADMIN_TEMP_PASSWORD`. The first login must set a new password of at least 12 characters. Until that is saved, the rest of the admin panel stays locked.

## Static brochure

The HTML site (`index.html`, fleet, car pages) is in this same repository. To publish it, create a second Vercel project from the same repo and leave Root Directory as `.`. That project has no database and no real admin login.
