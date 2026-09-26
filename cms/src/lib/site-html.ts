function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n: number) {
  return Number(n || 0).toLocaleString("en-US");
}

function sale(n: number) {
  const s = String(Math.round(Number(n || 0)));
  if (s.length <= 3) return `${s} BDT`;
  const last = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return `${parts.join(",")},${last} BDT`;
}

export function carPageHtml(car: {
  slug: string;
  make: string;
  model: string;
  year: number;
  type: string;
  seats: number;
  transmission: string;
  fuel: string;
  engine: string;
  color: string;
  luggage: string;
  rental_rate_per_day: number;
  sale_price: number;
  mileage_km: number;
  availability_status: string;
  description: string;
  features: string[];
  images: string[];
}, similar: Array<{ slug: string; make: string; model: string; year: number; rental_rate_per_day: number; image: string }>) {
  const name = `${car.year} ${car.make} ${car.model}`;
  const photos = car.images.length ? car.images : ["/assets/images/hero.jpg"];
  const main = photos[0].startsWith("http") || photos[0].startsWith("/") ? photos[0] : `/${photos[0]}`;
  const src = (path: string) => (path.startsWith("http") || path.startsWith("/") ? path : `/${path}`);
  const thumbs = photos.map((photo, index) => {
    const url = src(photo);
    return `<button type="button" data-thumb data-full="${esc(url)}" data-alt="${esc(name)} photo ${index + 1}" aria-label="Photo ${index + 1}" aria-current="${index === 0 ? "true" : "false"}"><img src="${esc(url)}" alt=""></button>`;
  }).join("");
  const specs = [
    ["Make", car.make], ["Model", car.model], ["Year", car.year], ["Type", car.type], ["Seats", car.seats],
    ["Transmission", car.transmission], ["Fuel", car.fuel], ["Engine", car.engine], ["Colour", car.color],
    ["Mileage", `${money(car.mileage_km)} km`], ["Luggage", car.luggage],
    ["Rental", `${money(car.rental_rate_per_day)} BDT/day`], ["Sale asking", sale(car.sale_price)],
    ["Status", car.availability_status], ["Pickup", "Daulatpur, Khulna, Bangladesh"],
  ].map(([label, value]) => `<tr><th scope="row">${esc(label)}</th><td>${esc(value)}</td></tr>`).join("");
  const features = car.features.map((item) => `<li>${esc(item)}</li>`).join("");
  const related = similar.map((item) => `<a class="btn btn-ghost" href="/car-detail-${esc(item.slug)}.html">${esc(item.year)} ${esc(item.make)} ${esc(item.model)} · ${money(item.rental_rate_per_day)} BDT/day</a>`).join(" ");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)} — Daulat Drive, Khulna</title>
<meta name="description" content="${esc(car.description.slice(0, 160) || `${name} for hire or sale from Daulatpur, Khulna.`)}">
<meta name="theme-color" content="#0b6efd">
<link rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/styles.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;600;700&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="site-head">
  <div class="topbar"><div class="container topbar-inner">
    <span class="hide-sm">Head office · Daulatpur, Khulna 9202, Bangladesh</span>
    <div class="topbar-links"><a href="mailto:mail@gmail.com">mail@gmail.com</a> · <a href="tel:+8801330132141">+8801330132141</a></div>
  </div></div>
  <header class="header"><div class="container header-inner">
    <a class="logo" href="/"><strong>Daulat Drive</strong><small>Rental &amp; Sales · Khulna</small></a>
    <nav class="site-nav" id="site-nav" aria-label="Primary">
      <a href="/">Home</a><a href="/fleet.html">Fleet</a><a href="/sale.html">For Sale</a><a href="/about.html">About</a><a href="/faq.html">FAQ</a><a href="/contact.html">Contact</a>
      <button class="btn btn-primary" type="button" data-open-booking data-slug="${esc(car.slug)}" data-intent="rent">Book a Car</button>
    </nav>
  </div></header>
</div>
<main id="main">
  <div class="page-hero"><div class="container">
    <p class="crumbs"><a href="/">Home</a> / <a href="/fleet.html">Fleet</a> / ${esc(name)}</p>
    <h1>${esc(name)}</h1>
    <p>${esc(car.type)} · ${esc(car.seats)} seats · ${esc(car.transmission)} · ${esc(car.fuel)}. Daily rate and asking price are in BDT.</p>
  </div></div>
  <div class="container detail-layout">
    <div>
      <div class="gallery" data-gallery tabindex="0" aria-label="Photos of ${esc(name)}">
        <div class="gallery__main">
          <img data-gallery-main src="${esc(main)}" alt="${esc(name)}" width="1408" height="768">
          <div class="gallery__nav"><button type="button" data-prev aria-label="Previous photo">‹</button><button type="button" data-next aria-label="Next photo">›</button></div>
        </div>
        <div class="thumbs">${thumbs}</div>
      </div>
      <h2>About this car</h2>
      <p>${esc(car.description)}</p>
      <h2>Specifications</h2>
      <table class="specs">${specs}</table>
      <h2>Features</h2>
      <ul class="feature-pills">${features || "<li>Inspect the car at the Daulatpur desk.</li>"}</ul>
      <h2>Other cars</h2>
      <p>${related || '<a href="/fleet.html">Browse the fleet</a>'}</p>
    </div>
    <aside class="booking-box" aria-label="Booking">
      <p class="eyebrow">${car.availability_status === "available" ? "Available" : "Reserved"}</p>
      <h2>Reserve this car</h2>
      <p class="rate-xl">${money(car.rental_rate_per_day)} BDT/day</p>
      <p class="help">Asking price ${esc(sale(car.sale_price))}. No payment is taken online.</p>
      <p class="notice" data-unavailable ${car.availability_status === "available" ? "hidden" : ""}>This car is reserved for rental. You can still enquire to buy, or call +8801330132141.</p>
      <form data-booking-form data-intent="rent" data-slug="${esc(car.slug)}" method="POST">
        <input type="hidden" name="intent" value="rent">
        <input type="hidden" name="car" value="${esc(car.slug)}">
        <div class="form-grid">
          <label>Name<input name="name" autocomplete="name" required></label>
          <label>Email<input name="email" type="email" autocomplete="email" required></label>
          <label>Phone<input name="phone" type="tel" autocomplete="tel" required placeholder="01XXXXXXXXX"></label>
          <label>Pickup location<select name="pickup_location" required>
            <option>Daulatpur, Khulna</option><option>Sonadanga, Khulna</option><option>Khalishpur, Khulna</option>
            <option>Khulna Railway Station</option><option>Jashore Airport (delivery, quoted separately)</option>
          </select></label>
          <label>Pickup date<input name="pickup" type="date"></label>
          <label>Pickup time<input name="pickup_time" type="time" value="09:00"></label>
          <label>Return date<input name="return" type="date"></label>
          <label>Return time<input name="return_time" type="time" value="09:00"></label>
          <label class="check"><input type="checkbox" name="driver"> Add a driver (1,500 BDT/day)</label>
          <label>Message<textarea name="message" placeholder="NID ready, or a question about the papers."></textarea></label>
          <div class="estimate" data-estimate aria-live="polite">Choose dates to estimate the hire.</div>
          <ul class="error-list" data-errors role="alert"></ul>
          <button class="btn btn-primary" type="submit" data-submit>Send reservation request</button>
          <button class="btn btn-accent" type="submit" data-set-intent="sale">Enquire to Buy</button>
          <p class="help">The desk calls +8801330132141 to confirm. A request is not a booking until then.</p>
        </div>
      </form>
    </aside>
  </div>
</main>
<footer class="footer"><div class="container footer-grid">
  <div><strong>Daulat Drive</strong><p>Daulatpur, Khulna 9202<br><a href="mailto:mail@gmail.com">mail@gmail.com</a><br><a href="tel:+8801330132141">+8801330132141</a></p></div>
  <div><h3>Explore</h3><ul><li><a href="/fleet.html">Fleet</a></li><li><a href="/sale.html">For sale</a></li><li><a href="/contact.html">Contact</a></li><li><a href="/admin">Desk login</a></li></ul></div>
</div></footer>
<div class="callbar"><a class="btn btn-primary" href="tel:+8801330132141">Call +8801330132141</a><button class="btn btn-accent" type="button" data-open-booking data-slug="${esc(car.slug)}" data-intent="rent">Book</button></div>
<dialog class="modal" id="booking-modal" aria-labelledby="booking-title">
  <div class="modal__head"><h2 id="booking-title">Request a reservation</h2><button class="icon-btn" type="button" data-close-modal aria-label="Close">×</button></div>
  <div class="modal__body"><form id="booking-form" method="POST" data-intent="rent">
    <input type="hidden" name="intent" value="rent">
    <div class="form-grid">
      <label>Name<input name="name" required></label>
      <label>Email<input name="email" type="email" required></label>
      <label>Phone<input name="phone" type="tel" required></label>
      <label>Pickup location<input name="pickup_location" value="Daulatpur, Khulna" required></label>
      <label>Car<select name="car" required><option value="${esc(car.slug)}">${esc(name)}</option></select></label>
      <div data-rent-only class="form-grid">
        <label>Pickup date<input name="pickup" type="date"></label>
        <label>Return date<input name="return" type="date"></label>
        <label class="check"><input type="checkbox" name="driver"> Add a driver (1,500 BDT/day)</label>
      </div>
      <label>Message<textarea name="message"></textarea></label>
      <div class="estimate" data-estimate></div>
      <ul class="error-list" data-errors role="alert"></ul>
      <button class="btn btn-primary" type="submit" data-submit>Send reservation request</button>
    </div>
  </form></div>
</dialog>
<script src="/data/cars.js"></script>
<script src="/assets/js/main.js"></script>
</body></html>`;
}
