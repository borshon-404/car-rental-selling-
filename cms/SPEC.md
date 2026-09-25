# Daulat CMS specification

Production JAMstack admin for Daulat Drive (Daulatpur, Khulna). The static brochure in the workspace root is unchanged. This app is the editable site.

## 1. Architecture

```
Browser ── HTTPS ── Next.js (App Router, TypeScript)
                      ├── public pages (ISR, revalidate 60s, busted on save)
                      ├── /admin  (cookie session)
                      ├── /api    (same cookie, same-origin writes)
                      └── Prisma
                            ├── SQLite file in local dev
                            └── Postgres on Vercel / Supabase
```

Saves call `revalidatePath` for the public routes, so an edit shows on the front without a rebuild. Unpublished drafts are not queried by public pages and are omitted from the sitemap when `robots` contains `noindex`.

Rendering is server components. The admin editors that need forms are client components and talk only to same-origin JSON routes. There is no separate API host and no browser call to `localhost`.

## 2. Stack choices

| Requested | Used |
| --- | --- |
| Next.js + TypeScript | Next.js 15, React 19, `strict` TypeScript |
| Tailwind | Not installed. Styles live in `src/app/globals.css` so the preview does not depend on a CSS pipeline. Class names are stable if Tailwind is added later. |
| Prisma + Postgres | Prisma 6. Local provider is SQLite so the sandbox runs with no database server. Switch the provider to `postgresql` for production. Models are compatible with both. |
| NextAuth or JWT | Custom JWT (`jose`, HS256) in httpOnly cookie `cms_session`. No third-party auth dependency. |
| Cloudinary or S3 | Signed Cloudinary upload when the three Cloudinary env vars are set. Otherwise `public/uploads` (local only). On Vercel, missing Cloudinary returns an error instead of writing to a read-only disk. S3 env names are reserved; the media row stores a public URL either way. |
| TipTap, Quill, or Markdown | Markdown subset in `src/lib/markdown.ts`. Input is escaped before tags are added. |

## 3. Data model

`prisma/schema.prisma`

- `User` — email, bcrypt hash, `role` (`admin` or `editor`), `mustChangePassword`
- `Page` + `Section` — full page body plus ordered visible sections
- `Post` — excerpt, cover, author, publish time
- `Product` — name, description, `priceCents`, currency (default `BDT`), SKU, image
- `PortfolioItem` — image, client, year, tags, summary, body
- `Media` — url, alt, mime, size
- `SiteChrome` — header JSON and footer JSON, one row `singleton`
- `Setting` — key/value. `smtp_password` is AES-GCM ciphertext
- `Revision` — JSON snapshot before each update or delete

Every public content type has `seoTitle`, `seoDescription`, `robots`, `canonicalUrl`, `ogTitle`, `ogDescription`, `ogImage`.

Prices are stored as integer cents so `3,500 BDT` is `350000` and `12,50,000 BDT` is `125000000`. The admin form asks for taka and multiplies by 100.

## 4. Auth and forced password change

Temporary admins are created with `mustChangePassword: true`.

```ts
const token = await new SignJWT(user)
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("12h")
  .sign(secret());
```

Cookie flags: `httpOnly`, `sameSite: "lax"`, `secure` when `NODE_ENV=production`, path `/`, 12 hours.

`src/middleware.ts` covers `/admin`, `/admin/:path*`, and `/api/:path*`. Login and the Search Console file route are public. If the token says `mustChangePassword`, every admin page except `/admin/change-password` redirects there, and every API except change-password and logout returns 403. `requireUser()` also re-reads the flag from the database, so a reset in the database is not ignored by server components.

Password rules on change: current password must match, new password at least 12 characters, and it must differ from the temporary one. The new hash is bcrypt cost 12. A fresh JWT is issued with the flag cleared.

Login is rate-limited to 8 attempts per IP per 15 minutes (in-memory; use a shared store if you run more than one instance). Failed login does not say which field was wrong.

## 5. Roles

| Action | admin | editor |
| --- | --- | --- |
| Create and edit content, upload media, edit header/footer | yes | yes |
| Delete content | yes | no |
| SEO, SMTP, analytics, Search Console | yes | no |

Create an editor with `ADMIN_ROLE=editor npm run create-admin`. There is no public signup.

## 6. Admin panel

| Route | Job |
| --- | --- |
| `/admin/login` | Email and password |
| `/admin/change-password` | Forced first-login change |
| `/admin` | Counts |
| `/admin/content/pages` | Pages and sections |
| `/admin/content/posts` | Journal |
| `/admin/content/products` | Add, edit, delete, price, description |
| `/admin/content/portfolio` | Image URL plus metadata |
| `/admin/chrome` | Header and footer JSON |
| `/admin/media` | Upload, alt text, copy URL |
| `/admin/settings` | Site URL, GA, GSC, robots extra, SMTP, test email, sitemap ping |

Writes are `POST`, `PATCH`, `PUT`, or `DELETE` with `content-type: application/json` except media, which is `multipart/form-data`.

## 7. Public routes

| URL | Source |
| --- | --- |
| `/` | Published page slug `home`, plus latest posts, products, portfolio |
| `/p/[slug]` | Other published pages and their visible sections |
| `/blog`, `/blog/[slug]` | Published posts |
| `/products`, `/products/[slug]` | Published products. Price formatted with `en-BD` |
| `/portfolio`, `/portfolio/[slug]` | Published portfolio items |
| `/sitemap.xml` | `src/app/sitemap.ts` |
| `/robots.txt` | `src/app/robots.ts` |
| `/google[token].html` | Rewritten to `/api/gsc-file` |

Drafts return 404 on the public site. Contact details in the seed footer are Daulatpur, Khulna 9202, mail@gmail.com, +8801330132141.

## 8. Media

Allowed types: JPEG, PNG, WEBP, GIF. Maximum 5 MB. SVG is rejected so a file cannot carry script. Alt text is required by the form guidance and stored on the row.

Cloudinary signature (folder and timestamp only, then the API secret):

```ts
const signature = createHash("sha1")
  .update(`folder=daulat-cms&timestamp=${timestamp}${cloudSecret}`)
  .digest("hex");
```

The returned `secure_url` is what editors paste into image fields. Local files are served from `/uploads/[filename]` with a one-day cache header.

## 9. SEO per item

Each editor has meta title (max 70 in the form), meta description (max 320), robots (`index,follow` / `noindex,follow` / `noindex,nofollow`), canonical URL, and Open Graph title, description, and image. Public `generateMetadata` maps those onto the document title, description, robots, canonical, and Open Graph. A text preview of the snippet is shown in the form.

JSON-LD: `AutoRental` on the home page, `BlogPosting` on posts, `Product` + `Offer` (price, `BDT`) on products.

## 10. Sitemap, robots, Search Console, Analytics

`/sitemap.xml` lists `/`, `/blog`, `/products`, `/portfolio`, and every published page, post, product, and portfolio item whose robots value does not contain `noindex`. The home page is listed once as `/`, not as `/p/home`.

`/robots.txt` allows `/`, disallows `/admin` and `/api`, appends extra `Allow` / `Disallow` lines saved in settings, and points at the sitemap.

Google Analytics: Measurement ID must match `G-` plus letters and digits. The tag is injected only when enabled and the ID matches. IP anonymisation is on. Leave it disabled until a real ID is saved.

Search Console:

- Meta method: token is rendered as `<meta name="google-site-verification" content="...">`.
- File method: set the token to the filename stem Google gives you (`googleXXXXXXXX`). The rewrite serves `/googleXXXXXXXX.html` with body `google-site-verification: googleXXXXXXXX.html`.

Sitemap ping posts the public sitemap URL to Google and Bing. Google has deprecated that ping endpoint; the useful step is submitting `/sitemap.xml` in Search Console. The button remains for Bing and for a manual check.

## 11. SMTP

Settings: host, port, secure (SSL vs STARTTLS), username, password, from-address. The password is encrypted before it is stored. A blank password or `********` does not overwrite the stored secret.

```ts
export function encryptSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  // stored as enc:<iv>:<tag>:<ciphertext>
}
```

`POST /api/settings/test-email` with `{ "to": "mail@gmail.com" }` verifies the transport and sends “Daulat CMS SMTP test”. Missing host or from-address returns 400. A refused connection returns 502 with the SMTP error. This was checked against a local sink (`scripts/dev-smtp.py` on port 1025); that script is a development helper, not a production server.

## 12. Security

- No secrets in the repo. `.env` is gitignored. `.env.example` has names and placeholders only.
- `AUTH_SECRET` and `SETTINGS_SECRET` must be at least 32 characters. They are different keys.
- Passwords are bcrypt hashes. SMTP passwords are AES-GCM, not reversible from the admin UI (the form never sends the stored value back).
- Write routes call `assertSameOrigin` so a cross-site form cannot use the cookie.
- Zod validates login, password change, and the test-email recipient.
- Content HTML is escaped in the markdown renderer.
- Response headers: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `poweredByHeader: false`. `X-Frame-Options` is intentionally unset so the hosted preview iframe can load the app.
- Admin and API are disallowed in robots.
- Rate limit on login.

## 13. Environment names

Copy `.env.example`. Do not put real values in git.

```
DATABASE_URL
AUTH_SECRET
SETTINGS_SECRET
NEXT_PUBLIC_SITE_URL
ADMIN_EMAIL
ADMIN_TEMP_PASSWORD
ADMIN_ROLE
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
S3_BUCKET
S3_REGION
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
S3_ENDPOINT
S3_PUBLIC_URL
GA_MEASUREMENT_ID
GSC_VERIFICATION_TOKEN
```

Admin settings override the SMTP, GA, GSC, and site URL values when those keys have been saved. Env remains the fallback when a key is empty. `SMTP_PASSWORD` is used only if no encrypted password is stored.

## 14. Deploy steps

1. Create a GitHub repository. Either push `cms/` as the root, or push the whole workspace and set Vercel Root Directory to `cms`.
2. Create a Postgres database (Supabase or Vercel Postgres).
3. In `prisma/schema.prisma`, set `provider = "postgresql"`.
4. Import the GitHub repo in Vercel. Framework preset Next.js. Build command: `npx prisma generate && npx prisma db push && next build`.
5. Add the env names from section 13. Generate `AUTH_SECRET` and `SETTINGS_SECRET` with `openssl rand -base64 32`. Set `NEXT_PUBLIC_SITE_URL` and `site_url` to the `https://` production origin. Set `ADMIN_TEMP_PASSWORD` to a throwaway value of 12+ characters.
6. Deploy. CI on GitHub runs `npm ci`, `prisma db push`, `tsc --noEmit`, and `next build` (see the workflow files).
7. Open `/admin/login`, sign in with `ADMIN_EMAIL`, and set a new password. The temporary password stops working for later logins only after that change is saved; the seed can re-arm the force-change flag if you run it again.
8. In SEO & SMTP, save the GA Measurement ID, the Search Console token (meta or file), and SMTP. Send a test email. Submit `https://<domain>/sitemap.xml` in Search Console.
9. Set Cloudinary env vars and redeploy before uploading media. Confirm `/sitemap.xml` and `/robots.txt`.

`db push` is appropriate for this schema. Switch to `prisma migrate deploy` once you start checking migration files into git.

## 15. Acceptance criteria

Checked against the running app on 25 Sep 2026:

| Check | Result |
| --- | --- |
| Edit a page and see the public page update | `PATCH /api/content/pages/:id` then `GET /` returned the new title and body |
| Add a product | `POST /api/content/products` created Honda Grace 2018; `/products/honda-grace-2018` returned 200 with the SEO title and BDT price |
| SMTP test | Local sink on port 1025 accepted “Daulat CMS SMTP test” to mail@gmail.com. Missing host returns 400 |
| Search Console token | Meta tag rendered after save. `/googletesttoken123.html` returned the verification file. Test token was then cleared |
| `/sitemap.xml` | 200, includes home, blog, products, portfolio, and the seeded slugs |
| Per-page SEO | Product document title was `Honda Grace 2018 hire · Daulat Drive`. Home, posts, pages, and portfolio read their own SEO fields |
| Forced password change | Login with the seed password returned `mustChangePassword: true`, `/admin` redirected to `/admin/change-password`, and content APIs returned 403 until the new 12+ character password was saved |
| Unauthenticated API | `GET /api/content/products` without a cookie returned 401 |
| Vercel | Steps are in section 14. This sandbox cannot create the Vercel project or a Postgres instance |

Temporary admin after the check was re-seeded, so first login still forces a password change.

Sample login body:

```json
{ "email": "admin@example.com", "password": "<ADMIN_TEMP_PASSWORD>" }
```

Sample product body (price is cents; the admin form converts taka):

```json
{
  "name": "Honda Grace 2018",
  "status": "published",
  "description": "Daily rate 3,500 BDT.",
  "priceCents": 350000,
  "currency": "BDT"
}
```
