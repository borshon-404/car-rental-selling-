# Daulat Drive — car rental & sales (Daulatpur, Khulna)

GitHub: https://github.com/borshon-404/car-rental-selling-

The static brochure is this folder. The admin login is the Next.js app in `cms/`. To deploy that login on Vercel, follow `VERCEL.md` and set the project Root Directory to `cms`. Do not use `admin.html` as the backend — it is only a static desk board.

Static site for a Khulna rental desk and used-car yard. Currency is BDT. Head office, email, and phone are wired through the pages below.

| | |
|---|---|
| Head office | Daulatpur, Khulna 9202, Bangladesh |
| Email | mail@gmail.com |
| Phone | +8801330132141 |
| Map pin | 22.8705, 89.5242 (Daulatpur, Khulna) |

This is a demo fleet (8 cars) so the pages, filters, and request form can be reviewed. Replace the cars, photos, and Formspree id before you advertise it.

## Manifest

| Path | What it is |
|---|---|
| `index.html` | Homepage: hero, search, hire cards, sale cards, services, FAQ, testimonials |
| `index_preview.html` | One-file preview. CSS and JS are inlined. Open this file directly for a quick review. |
| `fleet.html` | Full hire list with filters (type, seats, transmission, fuel, price, availability) |
| `sale.html` | Cars for sale, asking prices in lakh-style BDT, “Enquire to Buy” |
| `car-detail-*.html` | Eight pre-rendered car pages (Premio is rental-led, BMW 5 Series is sale-led) |
| `car-detail-TEMPLATE.html` | Copy this when you add a car by hand. Comment at the top explains the steps. |
| `about.html` | Office story, hours, map |
| `contact.html` | Contact form, phone, email, Google Map centred on Daulatpur |
| `faq.html` | Rental and sale questions |
| `terms.html` | Hire and sale terms |
| `privacy.html` | What the forms collect |
| `booking-confirmation.html` | Shown after a request. Reads the summary from this browser’s session storage. |
| `admin.html` | Optional static desk board. Not linked in the public menu. Not a real admin login. |
| `404.html` | Missing-page fallback |
| `assets/css/styles.css` | All layout. No paid CSS framework. |
| `assets/js/main.js` | Filters, booking estimate, Formspree / mailto, language toggle, gallery |
| `assets/images/` | Local photos. Catalog shots live in `assets/images/cars/`. |
| `data/cars.json` | The fleet dataset (also copied to `data/cars.js` so `file://` still works) |
| `data/i18n.json` | Sample English / Bengali strings |
| `data/bookings-sample.json` | Fake rows for `admin.html` |
| `tools/generate_site.py` | Regenerates HTML and JSON from one car list |
| `sitemap.xml`, `robots.txt`, `site.webmanifest` | Replace `YOUR_DOMAIN` before launch |
| `daulat-drive-khulna.zip` | The same folder, zipped for Netlify drop or handoff |

## Open locally

**Multi-page site (what you deploy)**

1. Unzip if you only have the zip.
2. Double-click `index.html`, or from this folder run:

```bash
python3 -m http.server 8080
```

3. Open `http://localhost:8080/`.

`index.html` also works if you open the file directly. Car data is inlined in `data/cars.js` as a fallback when `fetch("data/cars.json")` is blocked by the browser. A local server is still the better test, because that is how GitHub Pages and Netlify will serve it.

**One-file preview**

Open `index_preview.html` in Chrome, Firefox, Edge, or Safari. Search, filters, detail panel, and the booking modal run inside that file. Images point at `assets/images/` and fall back to Unsplash if a file is missing.

## Replace the phone, email, and office

Search the project for these three strings and replace them together:

- `mail@gmail.com`
- `+8801330132141`
- `Daulatpur, Khulna`

Also update the constants at the top of `tools/generate_site.py` (`EMAIL`, `PHONE`, `OFFICE`, `LAT`, `LNG`) and run:

```bash
python3 tools/generate_site.py
```

Map iframe and the directions link use `22.8705, 89.5242`. Change those if the yard gate is a different pin. Postal code used here is 9202 (Daulatpur TSO).

Visible spots: top bar, footer, contact page, about page, booking box, confirmation page, JSON-LD.

## Add or edit a car

**Preferred:** edit the `CARS` list in `tools/generate_site.py`, add three photos, then regenerate.

```bash
python3 tools/generate_site.py
```

Photos, named exactly like this:

- `assets/images/cars/your-slug-1.jpg` (main)
- `assets/images/cars/your-slug-2.jpg`
- `assets/images/cars/your-slug-3.jpg`
- optional smaller copies: `your-slug-1-800.jpg` and so on (the pages use `srcset`)

**By hand:** add an object to `data/cars.json`, duplicate the same array inside `data/cars.js` (`window.DAULAT_CARS_FALLBACK`), copy `car-detail-TEMPLATE.html` to `car-detail-your-slug.html`, and replace the slug, prices, copy, and image paths. The template comment at the top of each detail page lists the same steps.

Each car object:

```json
{
  "id": "toyota-premio-2019",
  "make": "Toyota",
  "model": "Premio",
  "year": 2019,
  "slug": "toyota-premio-2019",
  "type": "Sedan",
  "seats": 5,
  "transmission": "Automatic",
  "fuel": "Petrol",
  "rental_rate_per_day": 3500,
  "sale_price": 1250000,
  "images": ["https://images.unsplash.com/...", "...", "..."],
  "features": ["Cold AC", "ABS"],
  "description": "Short paragraph.",
  "availability_status": "available",
  "mileage_km": 62400
}
```

`availability_status` is `available` or `reserved`. Reserved cars stay on the fleet page but the rental submit is blocked. Sale enquiries are still allowed.

`images` are remote placeholders (Unsplash). The pages prefer `local_images` / files under `assets/images/cars/`. `data-fallback` on each `<img>` points at the Unsplash URL if you delete a local file.

Set `"focus": "sale"` on a car if that detail page should lead with the asking price (the BMW page does this). Anything else leads with the daily rate (the Premio page).

## Prices (BDT)

- Daily hire is grouped in thousands: `3,500 BDT/day`, `15,000 BDT/day`.
- Sale asking prices use Bangladeshi grouping: `12,50,000 BDT`, `50,00,000 BDT`.
- The booking estimate is `days × rental_rate_per_day`, plus `1,500 BDT/day` if “Add a driver” is ticked.
- Days are calendar chunks of 24 hours, minimum 1 if return is after pickup.
- Jashore Airport delivery is **not** in the estimate. The copy says it starts at 2,500 BDT and is quoted by the desk.
- Change the driver fee in `assets/js/main.js` → `CONFIG.driverPerDay`.
- Formatters: `formatDaily` and `formatSale` in `assets/js/main.js`, and `fmt_sale` / `fmt_daily_num` in `tools/generate_site.py`. Keep them in step if you change the rules.

## Forms (Formspree, Netlify, mailto)

Nothing is charged online. A request is not a confirmed booking.

1. Create a form at [https://formspree.io](https://formspree.io).
2. Copy the endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. Open `assets/js/main.js` and replace `YOUR_FORM_ID`:

```js
formspreeEndpoint: "https://formspree.io/f/abcdwxyz",
```

4. Replace the same placeholder in the `action="https://formspree.io/f/YOUR_FORM_ID"` attributes (search the HTML, or set it in `tools/generate_site.py` and regenerate). The script is what actually posts JSON. The `action` is the no-JavaScript fallback.
5. Send a test from the booking modal and from the contact page. In Formspree, confirm the submission arrived. On success the browser goes to `booking-confirmation.html`.
6. If the endpoint still contains `YOUR_FORM_ID`, or the network call fails, the site opens an email to `mail@gmail.com` and then shows the confirmation page. That is the intended fallback. Test it once with the placeholder still in place, then again after you paste the real id.

**Netlify Forms** (if you host on Netlify and do not want Formspree): add `netlify` and `netlify-honeypot="bot-field"` to the `<form>`, plus `<input type="hidden" name="form-name" value="booking">`. There is an HTML comment on the booking form marking that spot. Do not enable both Netlify Forms and a Formspree `fetch` on the same submit without deciding which one owns it. The script currently `preventDefault`s and posts JSON.

Do not put API secrets, SMTP passwords, or card numbers in these files.

## Deploy

### Zip

The handoff archive is `daulat-drive-khulna.zip` in this folder. To rebuild it:

```bash
cd /path/to/this/folder
zip -r daulat-drive-khulna.zip . -x "daulat-drive-khulna.zip" -x "*__pycache__*"
```

Unzip, then deploy the **folder** (Netlify’s drop zone wants the folder that contains `index.html`, not a zip nested inside another zip).

### GitHub Pages

```bash
cd /path/to/this/folder
git init
git add .
git commit -m "Publish Daulat Drive static site"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

In the repo: **Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save.**

After it is live, replace `YOUR_DOMAIN` in the HTML `<link rel="canonical">`, Open Graph tags, `sitemap.xml`, and `robots.txt`. A project site URL looks like `https://YOUR_USER.github.io/YOUR_REPO/`. If the site is not at the domain root, also check that asset paths stay relative (they already are: `assets/...`, `data/...`).

`.nojekyll` is included so GitHub Pages does not ignore folders that start with an underscore.

### Netlify

**Drag and drop:** [https://app.netlify.com/drop](https://app.netlify.com/drop) — drop the unzipped folder.

**Git:** connect the GitHub repo, publish directory `.`, no build command.

Optional later: turn on Netlify Forms as described above.

## Images

Local catalog photos are in `assets/images/cars/`. They are stand-ins for yard photos. Replace them with real pictures of your cars before you take bookings from the public. Keep the same filenames or update `local_images` and the `<img src>` paths.

`data/cars.json` → `images` holds Unsplash CDN URLs as the remote placeholders the brief asked for. They are **not** photos of these exact Bangladeshi cars. Each `<img>` has `data-fallback` pointing at one of those URLs, plus `srcset` for the 800px and 1400px local files, and `loading="lazy"` below the fold.

Hero, about, and social image:

- `assets/images/hero.jpg`
- `assets/images/about.jpg`
- `assets/images/og.jpg`

Comments in the HTML and in `assets/js/main.js` mark the same replacement points.

## WordPress / Elementor (Xarent kit)

This bundle is the static version. The reference kit is [Xarent — Car Rental Elementor Template Kit](https://themeforest.net/item/xarent-car-rental-elementor-template-kit/53817986) (Haidezign). It is a template kit, not a theme. It is meant for the free Hello Elementor theme.

Map these static sections onto the kit pages:

| Static file / section | Xarent kit template |
|---|---|
| `index.html` hero + search | Homepage hero + reservation form |
| Featured hire cards | Homepage “Featured Cars” |
| Sale band | Extra section, or a second listing filtered to sale |
| Why this desk / services / steps | Homepage “Why We Are”, “Why Choose Us”, “Our Services” |
| Testimonials | Testimonials template, or the homepage testimonial block |
| FAQ | Homepage FAQ, or a dedicated FAQ page |
| `about.html` | About Us |
| `fleet.html` | Our Cars |
| `car-detail-*.html` | Cars Detail |
| `contact.html` | Contact Us + contact form |
| Header / footer | Header and Footer templates (Elementor Pro theme builder, or the kit header/footer) |
| `booking-confirmation.html` | Thank-you page after the reservation form |

Suggested install:

1. WordPress + Hello Elementor.
2. Plugins the kit lists: Elementor, RomethemeKit, RomethemeForm. Elementor Pro is optional; use it if you want the header and footer in Theme Builder.
3. Import the kit (Envato Elements plugin, or Elementor → My Templates).
4. Create pages as the kit’s “How to use” note describes: Elementor Full Width, hide the page title, import the template.
5. Set **Settings → Reading** to a static front page.
6. Retype the Daulatpur address, `mail@gmail.com`, and `+8801330132141` into the header, footer, and contact template. Do not leave the kit’s lorem phone number.
7. Forms: Contact Form 7 or WPForms if you are not using RomethemeForm. Point notifications at `mail@gmail.com`. Do not put SMTP passwords in the page content.
8. Cars: either rebuild the eight cards in Elementor, or use a listing plugin later. This static site’s `data/cars.json` is the source to copy prices from.
9. Map: Elementor Google Maps widget, query `Daulatpur, Khulna`, or coordinates `22.8705, 89.5242`.
10. Optional speed plugin: WP Rocket, or a free alternative. Not required to launch.

Colours to paste into Elementor global styles: primary `#0b6efd`, accent `#ff6b00`, ink `#333333`, background `#f7f7f7`, navy `#071427`. Fonts: Poppins for headings, Inter for body. Bengali: Noto Sans Bengali.

## Language

The top bar has **EN / BN**. It swaps navigation, the hero, and a few buttons using strings in `assets/js/main.js` and `data/i18n.json`. Body paragraphs stay in English. That is a sample, not a full translation. To extend it, add keys to `data/i18n.json` and `data-i18n="your_key"` on the element.

## Optional extras (left off the public menu)

**Desk board.** Open `admin.html`. It renders `data/bookings-sample.json`. There is no password. Do not upload real customer names to a public URL.

**Card payments.** Not enabled. If you add them, use a hosted card field (Stripe, or a Bangladesh gateway that supports tokenisation). The browser should only receive a token. Never paste a secret key into `main.js` or HTML. A comment in `privacy.html` and `admin.html` marks that spot.

**Bengali.** See above. `data/i18n.json` is the sample file.

## Testing checklist

- [ ] 320px: menu opens, call bar shows `tel:+8801330132141`, no sideways scroll, cards stack.
- [ ] 768px: two-column cards, search fields wrap cleanly.
- [ ] 1024px and 1440px: nav is a row, filters stick, booking box sticks on a car page.
- [ ] Fleet filters: type, seats, transmission, fuel, max rate, “available only”, search, sort.
- [ ] Nissan Sunny shows Reserved and will not submit a rental. Sale enquiry still sends.
- [ ] Estimate changes when dates or “Add a driver” change.
- [ ] With `YOUR_FORM_ID` still in place, submit opens a mail to `mail@gmail.com` and then `booking-confirmation.html`.
- [ ] After a real Formspree id, submit lands in the Formspree inbox and then the confirmation page.
- [ ] Contact page map is centred on Daulatpur, Khulna. Directions link opens Google Maps.
- [ ] View source: title, description, Open Graph, and JSON-LD (`AutoRental` on every page, `Vehicle` on car pages).
- [ ] Keyboard: skip link, visible focus, Escape closes the booking dialog, gallery arrows work when the gallery is focused.

## Security and privacy

- No production secrets belong in this repo.
- Form mail should go through Formspree, Netlify Forms, or your own server — not a hidden SMTP password in JavaScript.
- The confirmation page keeps the last request in `sessionStorage` on that browser only.
- `privacy.html` describes what the forms collect. Update it if you add analytics or payments.
- `admin.html` is a mockup. Do not treat it as access control.

## Browser support

Current Chrome, Firefox, Edge, and Safari. The booking dialog uses `<dialog>`. If a very old browser has no `showModal`, the script still sets the dialog open. Layout is CSS grid and flex, no jQuery.
