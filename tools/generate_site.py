#!/usr/bin/env python3
"""Generate the Daulat Drive static site from one dataset.

Edit CARS below, then run: python3 tools/generate_site.py
Contact, phone, and office are constants at the top of this file.
Form endpoint lives in assets/js/main.js (CONFIG.formspreeEndpoint).
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EMAIL = "mail@gmail.com"
PHONE = "+8801330132141"
PHONE_TEL = "+8801330132141"
OFFICE = "Daulatpur, Khulna 9202, Bangladesh"
OFFICE_SHORT = "Daulatpur, Khulna, Bangladesh"
LAT, LNG = 22.8705, 89.5242
MAP_EMBED = f"https://maps.google.com/maps?q={LAT},{LNG}&z=15&hl=en&output=embed"
MAP_DIR = f"https://www.google.com/maps/dir/?api=1&destination={LAT},{LNG}"
WA = "https://wa.me/8801330132141"

# Unsplash URLs are demo placeholders (see README). The site displays local catalog
# photos in assets/images/cars/ and falls back to these URLs if a file is missing.
UNSPLASH = {
    "toyota-premio-2019": [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1400&q=80",
    ],
    "toyota-axio-2018": [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1400&q=80",
    ],
    "honda-civic-2020": [
        "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80",
    ],
    "nissan-sunny-2017": [
        "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1400&q=80",
    ],
    "pajero-sport-2019": [
        "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1400&q=80",
    ],
    "toyota-hiace-2015": [
        "https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1400&q=80",
    ],
    "maruti-swift-2021": [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=1400&q=80",
    ],
    "bmw-5series-2018": [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1400&q=80",
        "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1400&q=80",
    ],
}

CARS = [
    {
        "id": "toyota-premio-2019",
        "make": "Toyota",
        "model": "Premio",
        "year": 2019,
        "slug": "toyota-premio-2019",
        "type": "Sedan",
        "segment": "Executive",
        "seats": 5,
        "transmission": "Automatic",
        "fuel": "Petrol",
        "engine": "1.8L petrol",
        "color": "Pearl white",
        "luggage": "2 large bags",
        "rental_rate_per_day": 3500,
        "sale_price": 1250000,
        "mileage_km": 62400,
        "availability_status": "available",
        "focus": "rental",
        "features": ["Cold AC", "ABS with EBD", "Dual airbags", "Rear camera", "Bluetooth audio", "Power windows", "Alloy wheels", "Keyless entry"],
        "description": "A quiet pearl-white Premio for city meetings and the Jessore road. The AC holds in Khulna heat, the tyres are recent, and the papers are at the Daulatpur desk for you to read before you take the keys.",
    },
    {
        "id": "toyota-axio-2018",
        "make": "Toyota",
        "model": "Axio",
        "year": 2018,
        "slug": "toyota-axio-2018",
        "type": "Sedan",
        "segment": "Compact",
        "seats": 5,
        "transmission": "Automatic",
        "fuel": "Hybrid",
        "engine": "1.5L hybrid",
        "color": "Silver",
        "luggage": "2 medium bags",
        "rental_rate_per_day": 3200,
        "sale_price": 1100000,
        "mileage_km": 78200,
        "availability_status": "available",
        "focus": "rental",
        "features": ["Hybrid drive", "Eco mode", "Rear camera", "ABS", "Dual airbags", "USB audio", "Power steering", "Keyless entry"],
        "description": "The everyday Khulna car: light on fuel, easy to park in Sonadanga, and comfortable for four adults. A practical hire for the week, and a straightforward sale if you want to keep it.",
    },
    {
        "id": "honda-civic-2020",
        "make": "Honda",
        "model": "Civic",
        "year": 2020,
        "slug": "honda-civic-2020",
        "type": "Sedan",
        "segment": "Sport",
        "seats": 5,
        "transmission": "Automatic",
        "fuel": "Petrol",
        "engine": "1.5L turbo petrol",
        "color": "White",
        "luggage": "2 large bags",
        "rental_rate_per_day": 4500,
        "sale_price": 2200000,
        "mileage_km": 41000,
        "availability_status": "available",
        "focus": "rental",
        "features": ["Turbo engine", "Touchscreen audio", "Cruise control", "Rear camera", "ABS", "Airbags", "Alloy wheels", "Push start"],
        "description": "For clients who want a sharper drive than a standard sedan. Lower mileage than the rest of the yard, service notes available at the desk, and a firm asking price if you would rather buy than hire.",
    },
    {
        "id": "nissan-sunny-2017",
        "make": "Nissan",
        "model": "Sunny",
        "year": 2017,
        "slug": "nissan-sunny-2017",
        "type": "Sedan",
        "segment": "Compact",
        "seats": 5,
        "transmission": "Automatic",
        "fuel": "Petrol",
        "engine": "1.5L petrol",
        "color": "Silver",
        "luggage": "2 medium bags",
        "rental_rate_per_day": 2800,
        "sale_price": 950000,
        "mileage_km": 91500,
        "availability_status": "reserved",
        "focus": "rental",
        "features": ["AC", "Power steering", "ABS", "Audio system", "Power windows", "Central lock", "Spare wheel", "Floor mats"],
        "description": "A simple, inexpensive daily sedan. It is reserved for a weekly hire right now, so the rental form will not accept a new booking. Sale enquiries are still open — call the desk if you want to see it when it returns.",
    },
    {
        "id": "pajero-sport-2019",
        "make": "Mitsubishi",
        "model": "Pajero Sport",
        "year": 2019,
        "slug": "pajero-sport-2019",
        "type": "SUV",
        "segment": "Family",
        "seats": 7,
        "transmission": "Automatic",
        "fuel": "Diesel",
        "engine": "2.4L diesel",
        "color": "White",
        "luggage": "Family load behind the third row",
        "rental_rate_per_day": 9500,
        "sale_price": 3500000,
        "mileage_km": 54800,
        "availability_status": "available",
        "focus": "rental",
        "features": ["7 seats", "Diesel torque", "Rear camera", "Cruise control", "Roof rails", "Hill-start assist", "Alloy wheels", "Three-zone comfort"],
        "description": "The family and district-road SUV. Seven seats for a Sundarbans weekend or a relatives' visit, with enough clearance for roads outside the city. A driver can be added if you do not want to manage it yourself.",
    },
    {
        "id": "toyota-hiace-2015",
        "make": "Toyota",
        "model": "Hiace",
        "year": 2015,
        "slug": "toyota-hiace-2015",
        "type": "Microbus",
        "segment": "Group",
        "seats": 12,
        "transmission": "Manual",
        "fuel": "Diesel",
        "engine": "3.0L diesel",
        "color": "White",
        "luggage": "Rear luggage well",
        "rental_rate_per_day": 12000,
        "sale_price": 2800000,
        "mileage_km": 148000,
        "availability_status": "available",
        "focus": "rental",
        "features": ["12 seats", "High roof", "Dual AC", "Sliding door", "Diesel", "First-aid kit", "Seat belts", "Driver available"],
        "description": "The microbus for weddings, office shifts, and group tours out of Khulna. Twelve seats, a high roof, and dual AC. Most hirers take it with a driver — add that on the form and the estimate includes 1,500 BDT per day.",
    },
    {
        "id": "maruti-swift-2021",
        "make": "Maruti Suzuki",
        "model": "Swift",
        "year": 2021,
        "slug": "maruti-swift-2021",
        "type": "Hatchback",
        "segment": "City",
        "seats": 5,
        "transmission": "Manual",
        "fuel": "Petrol",
        "engine": "1.2L petrol",
        "color": "White",
        "luggage": "1 large bag",
        "rental_rate_per_day": 2500,
        "sale_price": 900000,
        "mileage_km": 28400,
        "availability_status": "available",
        "focus": "rental",
        "features": ["Light on fuel", "ABS", "Dual airbags", "Touchscreen audio", "Steering controls", "Rear parking sensors", "Power windows", "Compact size"],
        "description": "The budget hatch for short city hires and campus runs. Easy to place in a tight lane, lowest daily rate on the yard, and low kilometres if you are looking at it to buy.",
    },
    {
        "id": "bmw-5series-2018",
        "make": "BMW",
        "model": "5 Series",
        "year": 2018,
        "slug": "bmw-5series-2018",
        "type": "Sedan",
        "segment": "Luxury",
        "seats": 5,
        "transmission": "Automatic",
        "fuel": "Petrol",
        "engine": "2.0L petrol",
        "color": "Mineral white",
        "luggage": "2 large bags",
        "rental_rate_per_day": 15000,
        "sale_price": 5000000,
        "mileage_km": 46200,
        "availability_status": "available",
        "focus": "sale",
        "features": ["Leather seats", "Sunroof", "Navigation", "Parking sensors", "LED lights", "Cruise control", "Dual-zone AC", "Chauffeur recommended"],
        "description": "Occasional luxury hire, and a serious sale listing. Mineral white, kept for clients who want a quieter cabin than a standard sedan. A chauffeur is recommended. The asking price is 50,00,000 BDT — talk to the desk, do not expect an online checkout.",
    },
]

LOCATIONS = [
    "Daulatpur, Khulna",
    "Sonadanga, Khulna",
    "Khalishpur, Khulna",
    "Khulna Railway Station",
    "Jashore Airport (delivery, quoted separately)",
]

FAQ = [
    ("What do I need to rent a car?", "A valid Bangladesh driving licence, your NID or passport, and a refundable security deposit agreed at the desk. International visitors should bring a passport and an International Driving Permit if their licence is not in English. We photograph the papers; we do not keep the originals."),
    ("Is there an age requirement?", "The named driver must be at least 21. Drivers under 23 may be limited to the Swift, Sunny, and Axio. The BMW is 25 and above, or with a chauffeur."),
    ("Are there mileage limits?", "City and Khulna Division hires include 150 km per day. Extra kilometres are charged at the rate written on your reservation slip. Trips outside the division need written approval before you leave."),
    ("What about fuel, a driver, and airport delivery?", "Fuel is full-to-full: you return the car as you took it. A driver is 1,500 BDT per day and is added in the booking estimate. Delivery to Jashore Airport starts at 2,500 BDT and is quoted separately — it is not inside the daily rate."),
    ("Can I change or cancel?", "Cancel or move the dates more than 24 hours before pickup at no charge. Inside 24 hours, one day's hire may be kept. Call +8801330132141 rather than only sending a message."),
    ("How do sale prices work?", "The figure on the car page is the asking price in BDT, written in lakh style (for example 12,50,000). It is not a checkout total. You inspect the car at Daulatpur, read the papers, and agree the price there. A reserved rental car can still be discussed for sale."),
    ("Is an online request a confirmed booking?", "No. The form sends a request to the desk. The car is yours only after we call you back and confirm dates, papers, and the deposit. If the form service is not connected yet, the site opens an email to mail@gmail.com instead."),
    ("Where is the head office?", "Daulatpur, Khulna 9202, Bangladesh. The map on the contact page is centred on Daulatpur (22.8705, 89.5242). Open daily 8:00–21:00. Call before you come if you want a specific car pulled out."),
]


def esc(value) -> str:
    return (
        str(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def fmt_sale(n: int) -> str:
    s = str(int(n))
    if len(s) <= 3:
        return s + " BDT"
    last, rest = s[-3:], s[:-3]
    parts = []
    while len(rest) > 2:
        parts.insert(0, rest[-2:])
        rest = rest[:-2]
    if rest:
        parts.insert(0, rest)
    return ",".join(parts) + "," + last + " BDT"


def fmt_daily_num(n: int) -> str:
    return f"{int(n):,}"


def name_of(car) -> str:
    return f"{car['year']} {car['make']} {car['model']}"


def local_images(car):
    return [f"assets/images/cars/{car['slug']}-{i}.jpg" for i in (1, 2, 3)]


def public_car(car):
    data = dict(car)
    data["images"] = UNSPLASH[car["slug"]]
    data["local_images"] = local_images(car)
    return data


def img_tag(slug, n, alt, eager=False, sizes="(max-width: 700px) 100vw, 380px"):
    base = f"assets/images/cars/{slug}-{n}"
    fallback = UNSPLASH[slug][n - 1]
    loading = "eager" if eager else "lazy"
    pri = ' fetchpriority="high"' if eager else ""
    return (
        f'<img src="{base}.jpg" srcset="{base}-800.jpg 800w, {base}.jpg 1400w" '
        f'sizes="{sizes}" alt="{esc(alt)}" width="1408" height="768" loading="{loading}"{pri} '
        f'data-fallback="{fallback}">'
    )


LOGO = """<span class="logo__mark" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 32 32" fill="none"><path d="M5 21c1.4-5 4-7.5 8-7.5h6c4 0 6.6 2.5 8 7.5" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="11" cy="21" r="2" fill="#ff6b00"/><circle cx="21" cy="21" r="2" fill="#ff6b00"/><path d="M12 13.5h8" stroke="#ff6b00" stroke-width="2" stroke-linecap="round"/></svg></span>"""

CHECK = """<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="#e7f6ee"/><path d="M5 9.2 7.6 12 13 6.5" fill="none" stroke="#0d7a45" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>"""


def business_ld():
    return {
        "@context": "https://schema.org",
        "@type": "AutoRental",
        "name": "Daulat Drive",
        "description": "Car rental and car sales in Daulatpur, Khulna, Bangladesh.",
        "url": "https://YOUR_DOMAIN/",
        "telephone": PHONE,
        "email": EMAIL,
        "image": "https://YOUR_DOMAIN/assets/images/og.jpg",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Daulatpur",
            "addressLocality": "Khulna",
            "addressRegion": "Khulna Division",
            "postalCode": "9202",
            "addressCountry": "BD",
        },
        "geo": {"@type": "GeoCoordinates", "latitude": LAT, "longitude": LNG},
        "openingHours": "Mo-Su 08:00-21:00",
        "priceRange": "৳৳",
        "areaServed": "Khulna",
        "currenciesAccepted": "BDT",
    }


def vehicle_ld(car):
    availability = "https://schema.org/InStock" if car["availability_status"] == "available" else "https://schema.org/PreOrder"
    return {
        "@context": "https://schema.org",
        "@type": "Vehicle",
        "name": name_of(car),
        "brand": {"@type": "Brand", "name": car["make"]},
        "model": car["model"],
        "vehicleModelDate": str(car["year"]),
        "vehicleConfiguration": car["type"],
        "vehicleSeatingCapacity": car["seats"],
        "vehicleTransmission": car["transmission"],
        "fuelType": car["fuel"],
        "color": car["color"],
        "mileageFromOdometer": {"@type": "QuantitativeValue", "value": car["mileage_km"], "unitCode": "KMT"},
        "image": UNSPLASH[car["slug"]],
        "description": car["description"],
        "offers": [
            {
                "@type": "Offer",
                "priceCurrency": "BDT",
                "price": car["rental_rate_per_day"],
                "unitText": "DAY",
                "availability": availability,
                "seller": {"@type": "AutoRental", "name": "Daulat Drive", "telephone": PHONE},
            },
            {
                "@type": "Offer",
                "priceCurrency": "BDT",
                "price": car["sale_price"],
                "availability": "https://schema.org/InStock",
                "businessFunction": "http://purl.org/goodrelations/v1#Sell",
                "seller": {"@type": "AutoDealer", "name": "Daulat Drive", "telephone": PHONE},
            },
        ],
    }


NAV = [
    ("index.html", "Home", "nav_home", "home"),
    ("fleet.html", "Fleet", "nav_fleet", "fleet"),
    ("sale.html", "For Sale", "nav_sale", "sale"),
    ("about.html", "About", "nav_about", "about"),
    ("faq.html", "FAQ", "nav_faq", "faq"),
    ("contact.html", "Contact", "nav_contact", "contact"),
]


def page_href(filename, preview):
    if not preview:
        return filename
    anchors = {
        "index.html": "#home",
        "fleet.html": "#fleet",
        "sale.html": "#sale",
        "about.html": "#about",
        "faq.html": "#faq",
        "contact.html": "#contact",
        "terms.html": "#terms",
        "privacy.html": "#privacy",
    }
    if filename.startswith("car-detail-"):
        slug = filename[len("car-detail-"):-len(".html")]
        return "#car-" + slug
    return anchors.get(filename, filename)


def detail_attrs(car, preview):
    if preview:
        return f'href="#car-{car["slug"]}" data-preview-detail="{car["slug"]}"'
    return f'href="car-detail-{car["slug"]}.html"'


def location_options(selected="Daulatpur, Khulna"):
    bits = []
    for loc in LOCATIONS:
        sel = " selected" if loc == selected else ""
        bits.append(f'<option value="{esc(loc)}"{sel}>{esc(loc)}</option>')
    return "\n".join(bits)


def type_options(include_any=True):
    opts = ['<option value="all">Any type</option>'] if include_any else []
    for label, value in [("Sedan", "Sedan"), ("SUV", "SUV"), ("Hatchback", "Hatchback"), ("Microbus", "Microbus"), ("Luxury", "Luxury")]:
        opts.append(f'<option value="{value}">{label}</option>')
    return "\n".join(opts)


def chrome_open(title, description, filename, active, jsonld_blocks, preview=False):
    blocks = "\n".join(
        '<script type="application/ld+json">\n' + json.dumps(block, ensure_ascii=False, indent=2) + "\n</script>"
        for block in jsonld_blocks
    )
    nav = []
    for href, label, key, key_id in NAV:
        current = ' aria-current="page"' if active == key_id else ""
        nav.append(f'<a href="{page_href(href, preview)}" data-i18n="{key}"{current}>{label}</a>')
    nav.append(f'<button class="btn btn-primary" type="button" data-open-booking data-intent="rent" data-i18n="nav_book">Book a Car</button>')
    css_link = "" if preview else '<link rel="stylesheet" href="assets/css/styles.css">'
    extra_preview = ' data-preview="true"' if preview else ""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<meta name="theme-color" content="#0b6efd">
<meta name="robots" content="index,follow">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_BD">
<meta property="og:image" content="assets/images/og.jpg">
<meta property="og:url" content="https://YOUR_DOMAIN/{filename}">
<link rel="canonical" href="https://YOUR_DOMAIN/{filename}">
<!-- REPLACE YOUR_DOMAIN above before launch. Contact: {EMAIL} · {PHONE} · {OFFICE_SHORT} -->
<link rel="icon" href="assets/images/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/images/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="assets/images/icon-192.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;600;700&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">
{css_link}
{blocks}
</head>
<body{extra_preview}>
<a class="skip-link" href="#main">Skip to content</a>
<div class="site-head">
  <div class="topbar">
    <div class="container topbar-inner">
      <span class="hide-sm">Head office · {OFFICE}</span>
      <div class="topbar-links">
        <a href="mailto:{EMAIL}">{EMAIL}</a>
        <span class="dot" aria-hidden="true">·</span>
        <a href="tel:{PHONE_TEL}">{PHONE}</a>
        <span class="lang-switch" role="group" aria-label="Language">
          <button type="button" data-lang="en" aria-pressed="true">EN</button>
          <button type="button" data-lang="bn" aria-pressed="false" lang="bn" aria-label="বাংলা">BN</button>
        </span>
      </div>
    </div>
  </div>
  <header class="header">
    <div class="container header-inner">
      <a class="logo" href="{page_href('index.html', preview)}">
        {LOGO}
        <span class="logo__text"><strong>Daulat Drive</strong><small>Rental &amp; Sales · Khulna</small></span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        <span></span><span></span><span></span>
        <span class="sr-only">Menu</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Primary">
        {''.join(nav)}
      </nav>
    </div>
  </header>
</div>
"""


def footer(preview=False):
    return f"""
<footer class="footer">
  <div class="container footer-grid">
    <div>
      <a class="logo" href="{page_href('index.html', preview)}" style="margin-bottom:10px">
        {LOGO}
        <span class="logo__text"><strong style="color:#fff">Daulat Drive</strong><small style="color:#c9d4e4">Rental &amp; Sales · Khulna</small></span>
      </a>
      <p>Daily and weekly car hire, and inspected cars for sale, from the head office in Daulatpur, Khulna.</p>
      <p><a href="mailto:{EMAIL}">{EMAIL}</a><br><a href="tel:{PHONE_TEL}">{PHONE}</a></p>
    </div>
    <div>
      <h3>Visit</h3>
      <ul>
        <li>{OFFICE}</li>
        <li>Open daily, 8:00–21:00</li>
        <li><a href="{MAP_DIR}" rel="noopener">Directions</a></li>
        <li><a href="{WA}" rel="noopener">WhatsApp {PHONE}</a></li>
      </ul>
    </div>
    <div>
      <h3>Explore</h3>
      <ul>
        <li><a href="{page_href('fleet.html', preview)}">Rental fleet</a></li>
        <li><a href="{page_href('sale.html', preview)}">Cars for sale</a></li>
        <li><a href="{page_href('about.html', preview)}">About the desk</a></li>
        <li><a href="{page_href('faq.html', preview)}">FAQ</a></li>
        <li><a href="{page_href('contact.html', preview)}">Contact</a></li>
      </ul>
    </div>
    <div>
      <h3>Policies</h3>
      <ul>
        <li><a href="{page_href('terms.html', preview)}">Rental terms</a></li>
        <li><a href="{page_href('privacy.html', preview)}">Privacy</a></li>
        <li><a href="booking-confirmation.html">Request confirmation</a></li>
        <!-- Optional admin mockup is not linked in the public nav: admin.html -->
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>© 2026 Daulat Drive · {OFFICE_SHORT}</span>
    <!-- REMOVE WHEN LIVE: sample inventory line -->
    <span class="footer-demo">Sample listings for setup. Confirm any car on {PHONE}.</span>
  </div>
</footer>
<div class="callbar" role="region" aria-label="Quick contact">
  <a class="btn btn-primary" href="tel:{PHONE_TEL}">Call {PHONE}</a>
  <button class="btn btn-accent" type="button" data-open-booking data-intent="rent">Book</button>
</div>
"""


def modal():
    return f"""
<dialog class="modal" id="booking-modal" aria-labelledby="booking-title">
  <div class="modal__head">
    <h2 id="booking-title">Request a reservation</h2>
    <button class="icon-btn" type="button" data-close-modal aria-label="Close">×</button>
  </div>
  <div class="modal__body">
    <!-- REPLACE form action with your Formspree endpoint. JS uses CONFIG.formspreeEndpoint in assets/js/main.js.
         If that still contains YOUR_FORM_ID, submit falls back to mailto:{EMAIL}.
         Netlify: add netlify netlify-honeypot="bot-field" and a hidden input name="form-name" value="booking". -->
    <form id="booking-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST" data-intent="rent">
      <input type="hidden" name="intent" value="rent">
      <input type="hidden" name="_subject" value="Daulat Drive reservation">
      <p class="sr-only"><label>Leave blank<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></p>
      <div class="form-grid">
        <label>Name<input name="name" autocomplete="name" required></label>
        <label>Email<input name="email" type="email" autocomplete="email" required></label>
        <label>Phone<input name="phone" type="tel" autocomplete="tel" required placeholder="01XXXXXXXXX"></label>
        <label>Pickup location
          <select name="pickup_location" required>{location_options()}</select>
        </label>
        <label>Car
          <select name="car" required><option value="">Loading cars…</option></select>
        </label>
        <div data-rent-only class="form-grid">
          <label>Pickup date<input name="pickup" type="date"></label>
          <label>Pickup time<input name="pickup_time" type="time" value="09:00"></label>
          <label>Return date<input name="return" type="date"></label>
          <label>Return time<input name="return_time" type="time" value="09:00"></label>
          <label class="check"><input type="checkbox" name="driver"> Add a driver (1,500 BDT/day)</label>
        </div>
        <label>Message<textarea name="message" placeholder="NID ready, preferred colour, or a question about the papers."></textarea></label>
        <p class="notice" data-unavailable hidden>This car is reserved for rental. Call {PHONE} to join the waitlist, or send a sale enquiry instead.</p>
        <div class="estimate" id="booking-estimate" data-estimate aria-live="polite">Choose dates to estimate the hire.</div>
        <ul class="error-list" data-errors role="alert"></ul>
        <button class="btn btn-primary" type="submit" data-submit data-set-intent="rent">Send reservation request</button>
        <button class="btn btn-accent" type="submit" data-set-intent="sale">Enquire to Buy</button>
        <p class="help">No payment is taken online. If the form service is not connected, your email app opens a message to {EMAIL}. Airport delivery is quoted separately.</p>
      </div>
    </form>
  </div>
</dialog>
"""


def scripts(preview=False):
    if preview:
        return ""
    return """
<script src="data/cars.js"></script>
<script src="assets/js/main.js"></script>
</body>
</html>
"""


def car_card(car, mode="rent", preview=False, eager=False):
    status = "Available" if car["availability_status"] == "available" else "Reserved"
    status_cls = "badge--ok" if car["availability_status"] == "available" else "badge--no"
    lux = '<span class="badge badge--lux">Luxury</span>' if car["segment"] == "Luxury" else ""
    alt = f"{name_of(car)} {car['color']} {car['type'].lower()} for rent and sale in Khulna"
    if mode == "sale":
        price = f'<p class="price">{fmt_sale(car["sale_price"]).replace(" BDT", "")} <small>BDT</small></p>'
        note = f'<p class="sale-note">Rent {fmt_daily_num(car["rental_rate_per_day"])} BDT/day</p>'
        cta = f'<button class="btn btn-accent" type="button" data-open-booking data-slug="{car["slug"]}" data-intent="sale" data-i18n="enquire">Enquire to Buy</button>'
        badges = f'<span class="badge badge--sale">For sale</span>{lux}'
    else:
        price = f'<p class="price">{fmt_daily_num(car["rental_rate_per_day"])} <small>BDT/day</small></p>'
        note = f'<p class="sale-note">Sale {fmt_sale(car["sale_price"])}</p>'
        cta = f'<button class="btn btn-accent" type="button" data-open-booking data-slug="{car["slug"]}" data-intent="rent" data-i18n="book">Book</button>'
        badges = f'<span class="badge {status_cls}">{status}</span><span class="badge badge--rent">Rent</span>{lux}'
    return f"""
<article class="car-card" data-id="{car['slug']}" data-slug="{car['slug']}" data-name="{esc(car['make'] + ' ' + car['model'])}" data-type="{esc(car['type'])}" data-segment="{esc(car['segment'])}" data-seats="{car['seats']}" data-transmission="{esc(car['transmission'])}" data-fuel="{esc(car['fuel'])}" data-rate="{car['rental_rate_per_day']}" data-sale="{car['sale_price']}" data-status="{car['availability_status']}" data-year="{car['year']}">
  <a class="car-card__media" {detail_attrs(car, preview)}>
    {img_tag(car['slug'], 1, alt, eager=eager)}
    <span class="car-card__badges">{badges}</span>
  </a>
  <div class="car-card__body">
    <p class="car-card__kicker">{esc(car['type'])} · {car['year']} · {esc(car['color'])}</p>
    <h3><a {detail_attrs(car, preview)}>{esc(car['make'])} {esc(car['model'])}</a></h3>
    <ul class="spec-row">
      <li>{car['seats']} seats</li>
      <li>{esc(car['transmission'])}</li>
      <li>{esc(car['fuel'])}</li>
    </ul>
    <div class="price-row">{price}{note}</div>
    <div class="car-card__actions">
      <a class="btn btn-primary" {detail_attrs(car, preview)} data-i18n="view">View Details</a>
      {cta}
    </div>
  </div>
</article>
"""


def search_card(preview=False):
    action = "#fleet" if preview else "fleet.html"
    return f"""
<div class="search-wrap">
  <form class="container search-card" id="hero-search" action="{action}" method="get" role="search">
    <label>Pickup location
      <select name="location">{location_options()}</select>
    </label>
    <label>Pickup date<input type="date" name="pickup"></label>
    <label>Return date<input type="date" name="return"></label>
    <label>Car type<select name="type">{type_options()}</select></label>
    <button class="btn btn-primary" type="submit" data-i18n="search">Search fleet</button>
  </form>
</div>
"""


def home_main(preview=False):
    featured = [c for c in CARS if c["slug"] in {
        "toyota-premio-2019", "honda-civic-2020", "pajero-sport-2019",
        "maruti-swift-2021", "toyota-hiace-2015", "bmw-5series-2018",
    }]
    sale_picks = [c for c in CARS if c["slug"] in {"bmw-5series-2018", "pajero-sport-2019", "toyota-hiace-2015", "honda-civic-2020"}]
    cards = "\n".join(car_card(c, "rent", preview, eager=(i < 2)) for i, c in enumerate(featured))
    sale_cards = "\n".join(car_card(c, "sale", preview) for c in sale_picks)
    return f"""
<main id="main">
  <section class="hero" id="home">
    <div class="container hero-copy">
      <p class="eyebrow" data-i18n="hero_kicker">Daulatpur yard · Khulna</p>
      <h1 data-i18n="hero_title">Reliable Car Rental &amp; Sales — Daulatpur, Khulna</h1>
      <p class="lede" data-i18n="hero_sub">Daily and weekly hires from the Daulatpur yard, plus inspected cars for sale. Rates in BDT. Call to confirm a car is on the lot.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="{page_href('fleet.html', preview)}">Browse the fleet</a>
        <a class="btn btn-ghost" href="{page_href('sale.html', preview)}">Cars for sale</a>
      </div>
      <ul class="hero-points">
        <li>From 2,500 BDT/day</li>
        <li>Asking prices in BDT</li>
        <li>Head office in Daulatpur</li>
        <li>No online charge</li>
      </ul>
    </div>
  </section>
  {search_card(preview)}
  <section class="section">
    <div class="container">
      <div class="stats">
        <div class="stat"><strong>8</strong><span>cars on this demo yard</span></div>
        <div class="stat"><strong>2,500</strong><span>BDT/day from the Swift</span></div>
        <div class="stat"><strong>8:00–21:00</strong><span>open daily</span></div>
        <div class="stat"><strong>9202</strong><span>Daulatpur, Khulna</span></div>
      </div>
    </div>
  </section>
  <section class="section section--bg" id="featured">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="eyebrow">01 — Fleet</p>
          <h2>Cars you can hire this week</h2>
          <p>Rates are per day in BDT. A request is not a confirmed booking until the desk calls you.</p>
        </div>
        <a class="btn btn-outline" href="{page_href('fleet.html', preview)}">See all cars</a>
      </div>
      <div class="card-grid">{cards}</div>
    </div>
  </section>
  <section class="section band-navy" id="for-sale">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="eyebrow">02 — Sales</p>
          <h2>Cars for sale, asking prices in BDT</h2>
          <p>Lakh-style figures, for example 12,50,000 BDT. Inspect the car at the yard before you agree anything.</p>
        </div>
        <a class="btn btn-ghost" href="{page_href('sale.html', preview)}">All cars for sale</a>
      </div>
      <div class="card-grid">{sale_cards}</div>
    </div>
  </section>
  <section class="section">
    <div class="container split">
      <img src="assets/images/about.jpg" alt="Daulat Drive yard in Daulatpur, Khulna, with sedans and a white microbus" width="1408" height="768" loading="lazy">
      <div>
        <p class="eyebrow">Why this desk</p>
        <h2>A small yard. The car on the page is the car on the lot.</h2>
        <p>Daulat Drive is the rental and sales counter at Daulatpur, Khulna. You can hire for a day, a week, or a family trip, or ask about buying a car you have already driven.</p>
        <ul class="check-list">
          <li>{CHECK}<span>Rates shown in BDT before you send a request.</span></li>
          <li>{CHECK}<span>Papers available to read at the desk — licence, NID, and a deposit.</span></li>
          <li>{CHECK}<span>Self-drive or a driver at 1,500 BDT/day.</span></li>
          <li>{CHECK}<span>Head office you can actually visit: {OFFICE}.</span></li>
        </ul>
        <a class="btn btn-primary" href="{page_href('about.html', preview)}">About the office</a>
      </div>
    </div>
  </section>
  <section class="section section--bg">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="eyebrow">Services</p>
          <h2>Flexible hires for Khulna roads</h2>
        </div>
      </div>
      <div class="service-grid">
        <article class="service"><div class="icon-blob" aria-hidden="true">{LOGO}</div><h3>City rental</h3><p>Sedans and the Swift for Sonadanga, Khalishpur, and the working day. From 2,500 BDT/day.</p></article>
        <article class="service"><div class="icon-blob" aria-hidden="true">{LOGO}</div><h3>Jashore Airport</h3><p>Delivery to the airport is quoted from 2,500 BDT on top of the daily rate. Tell us the flight time.</p></article>
        <article class="service"><div class="icon-blob" aria-hidden="true">{LOGO}</div><h3>Weddings &amp; shifts</h3><p>The Hiace takes 12. Add a driver on the form if the group should not self-drive.</p></article>
        <article class="service"><div class="icon-blob" aria-hidden="true">{LOGO}</div><h3>Buy from the yard</h3><p>Every hire car also has an asking price. Enquire to buy, then come and see the papers.</p></article>
      </div>
      <div class="brand-row" aria-label="Brands on the yard">
        <span>Toyota</span><span>Honda</span><span>Nissan</span><span>Mitsubishi</span><span>Suzuki</span><span>BMW</span>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head"><div><p class="eyebrow">How it works</p><h2>Three steps, then a phone call</h2></div></div>
      <div class="step-grid">
        <article class="step"><p class="step__num">01</p><h3>Choose the car</h3><p>Filter by type, seats, fuel, and the daily rate. Open the page and read the kilometres.</p></article>
        <article class="step"><p class="step__num">02</p><h3>Send a request</h3><p>Name, phone, dates, and the car. You will see the estimated hire before you submit. Nothing is charged online.</p></article>
        <article class="step"><p class="step__num">03</p><h3>Pick up in Daulatpur</h3><p>We confirm by phone. Bring your licence and NID. The keys are at {OFFICE_SHORT}.</p></article>
      </div>
    </div>
  </section>
  <section class="section section--bg">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="eyebrow">Testimonials</p>
          <h2>What clients say</h2>
        </div>
      </div>
      <div class="quote-grid">
        <figure class="quote"><p>“The Premio was ready when I reached Daulatpur, papers on the counter, and the rate was the rate on the page. No surprise at the gate.”</p><footer><span class="avatar" aria-hidden="true">FR</span><span><cite>Farhana Rahman</cite><small>Sonadanga · sample review</small></span></footer></figure>
        <figure class="quote"><p>“We took the Hiace for a wedding shift. The driver knew the lane. I would book the microbus again rather than three separate cars.”</p><footer><span class="avatar" aria-hidden="true">NJ</span><span><cite>Nusrat Jahan</cite><small>Khalishpur · sample review</small></span></footer></figure>
        <figure class="quote"><p>“I hired the Axio for a week, then asked about buying it. They let me read the service notes before we talked price.”</p><footer><span class="avatar" aria-hidden="true">IK</span><span><cite>Imran Kabir</cite><small>Daulatpur · sample review</small></span></footer></figure>
      </div>
      <p class="sample-note">Sample stories for the layout. Replace them with your own clients before you publish.</p>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="eyebrow">FAQ</p>
          <h2>Before you call</h2>
        </div>
        <a class="btn btn-outline" href="{page_href('faq.html', preview)}">All questions</a>
      </div>
      <div class="faq-list">
        {''.join(f'<details class="faq"><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in FAQ[:4])}
      </div>
    </div>
  </section>
  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="cta">
        <div>
          <h2>Book the car, then we confirm from Daulatpur.</h2>
          <p>Call {PHONE} or send a request. Email {EMAIL}. Head office: {OFFICE}.</p>
        </div>
        <div class="cta-actions">
          <button class="btn btn-accent" type="button" data-open-booking>Request a car</button>
          <a class="btn btn-ghost" href="tel:{PHONE_TEL}">Call {PHONE}</a>
        </div>
      </div>
    </div>
  </section>
</main>
"""


def listing_page(mode, preview=False):
    if mode == "sale":
        title = "Cars for sale in Khulna"
        lede = "Asking prices in BDT, lakh style. Enquire to buy, then inspect the car at the Daulatpur desk."
        grid_mode = "sale"
        max_val, max_min, step = 5000000, 900000, 50000
        max_label = "Max asking price"
    else:
        title = "Rental fleet"
        lede = "Filter by type, seats, transmission, fuel, and daily rate. Reserved cars stay visible so you can ask about the waitlist."
        grid_mode = "rent"
        max_val, max_min, step = 15000, 2500, 100
        max_label = "Max daily rate"
    cards = "\n".join(car_card(c, grid_mode, preview) for c in CARS)
    seats = "".join(f'<option value="{n}">{n} seats</option>' for n in (5, 7, 12))
    return f"""
<main id="main">
  <div class="page-hero">
    <div class="container">
      <p class="crumbs"><a href="{page_href('index.html', preview)}">Home</a> / {title}</p>
      <h1>{title}</h1>
      <p>{lede} Head office: {OFFICE}. {EMAIL} · {PHONE}.</p>
    </div>
  </div>
  <form data-filter-form>
    <div class="container listing-layout">
      <aside class="filters" aria-label="Filter cars">
        <h2>Filter</h2>
        <label>Search<input type="search" name="q" placeholder="Premio, Hiace, BMW"></label>
        <label>Type<select name="type">{type_options()}</select></label>
        <label>Seats<select name="seats"><option value="all">Any</option>{seats}</select></label>
        <label>Transmission<select name="transmission"><option value="all">Any</option><option>Automatic</option><option>Manual</option></select></label>
        <label>Fuel<select name="fuel"><option value="all">Any</option><option>Petrol</option><option>Diesel</option><option>Hybrid</option></select></label>
        <label>Availability<select name="availability"><option value="all">All</option><option value="available">Available only</option></select></label>
        <label>{max_label}
          <input type="range" name="max" min="{max_min}" max="{max_val}" step="{step}" value="{max_val}">
          <span class="range-readout" data-max-readout></span>
        </label>
        <button class="btn btn-outline" type="button" data-filter-reset>Reset filters</button>
      </aside>
      <div>
        <div class="result-bar">
          <p><span data-result-count>8 cars</span></p>
          <label>Sort
            <select name="sort">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="year">Newest year</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
        <div class="card-grid" data-car-grid="{grid_mode}">{cards}</div>
        <p class="empty" data-empty hidden>No cars match those filters. Reset, or call {PHONE} and we will tell you what is on the lot.</p>
      </div>
    </div>
  </form>
</main>
"""


def booking_box(car):
    sale_focus = car["focus"] == "sale"
    primary = "sale" if sale_focus else "rent"
    rent_cls = "btn btn-outline" if sale_focus else "btn btn-primary"
    sale_cls = "btn btn-primary" if sale_focus else "btn btn-accent"
    big = fmt_sale(car["sale_price"]) if sale_focus else f"{fmt_daily_num(car['rental_rate_per_day'])} BDT/day"
    sub = f"Also for hire at {fmt_daily_num(car['rental_rate_per_day'])} BDT/day" if sale_focus else f"Asking price {fmt_sale(car['sale_price'])}"
    return f"""
<aside class="booking-box" aria-label="Booking">
  <p class="eyebrow">{'Sale listing' if sale_focus else 'Rental'}</p>
  <h2>{'Enquire to buy' if sale_focus else 'Reserve this car'}</h2>
  <p class="rate-xl">{big}</p>
  <p class="help">{sub}. Status: {car['availability_status']}.</p>
  <p class="notice" data-unavailable {'hidden' if car['availability_status']=='available' else ''}>This car is reserved for rental. You can still enquire to buy, or call {PHONE} for the waitlist.</p>
  <!-- REPLACE the form action when you have a Formspree id. JS falls back to mailto:{EMAIL}. -->
  <form data-booking-form data-intent="{primary}" data-slug="{car['slug']}" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
    <input type="hidden" name="intent" value="{primary}">
    <input type="hidden" name="car" value="{car['slug']}">
    <input type="hidden" name="_subject" value="Daulat Drive — {esc(name_of(car))}">
    <div class="form-grid">
      <label>Name<input name="name" autocomplete="name" required></label>
      <label>Email<input name="email" type="email" autocomplete="email" required></label>
      <label>Phone<input name="phone" type="tel" autocomplete="tel" required></label>
      <label>Pickup location<select name="pickup_location">{location_options()}</select></label>
      <label>Pickup date<input name="pickup" type="date"></label>
      <label>Pickup time<input name="pickup_time" type="time" value="09:00"></label>
      <label>Return date<input name="return" type="date"></label>
      <label>Return time<input name="return_time" type="time" value="09:00"></label>
      <label class="check"><input type="checkbox" name="driver"> Add a driver (1,500 BDT/day)</label>
      <label>Message<textarea name="message"></textarea></label>
      <div class="estimate" data-estimate aria-live="polite"></div>
      <ul class="error-list" data-errors role="alert"></ul>
      <button class="{rent_cls}" type="submit" data-set-intent="rent" data-submit>Request reservation</button>
      <button class="{sale_cls}" type="submit" data-set-intent="sale">Enquire to Buy</button>
      <p class="help">Estimate = days × daily rate, plus driver if ticked. Jashore Airport delivery is extra. <a href="mailto:{EMAIL}">Email {EMAIL}</a> · <a href="tel:{PHONE_TEL}">Call {PHONE}</a></p>
    </div>
  </form>
</aside>
"""


def detail_page(car, preview=False):
    similar = [c for c in CARS if c["slug"] != car["slug"] and (c["type"] == car["type"] or c["segment"] == car["segment"])][:3]
    if len(similar) < 3:
        for extra in CARS:
            if extra["slug"] != car["slug"] and extra not in similar:
                similar.append(extra)
            if len(similar) == 3:
                break
    alt = f"{name_of(car)}, {car['color']} {car['type'].lower()}"
    thumbs = []
    for n in (1, 2, 3):
        full = f"assets/images/cars/{car['slug']}-{n}.jpg"
        thumbs.append(
            f'<button type="button" data-thumb data-full="{full}" data-alt="{esc(alt)} view {n}" aria-label="Photo {n}" aria-current="{"true" if n==1 else "false"}">'
            f'<img src="assets/images/cars/{car["slug"]}-{n}-800.jpg" alt="" width="800" height="436"></button>'
        )
    features = "".join(f"<li>{esc(f)}</li>" for f in car["features"])
    specs = [
        ("Make", car["make"]), ("Model", car["model"]), ("Year", car["year"]),
        ("Type", car["type"] if car["segment"] != "Luxury" else "Luxury sedan"),
        ("Seats", car["seats"]), ("Transmission", car["transmission"]), ("Fuel", car["fuel"]),
        ("Engine", car["engine"]), ("Colour", car["color"]), ("Mileage", f"{car['mileage_km']:,} km"),
        ("Luggage", car["luggage"]), ("Rental", f"{fmt_daily_num(car['rental_rate_per_day'])} BDT/day"),
        ("Sale asking", fmt_sale(car["sale_price"])), ("Status", car["availability_status"]),
        ("Pickup", OFFICE_SHORT),
    ]
    spec_rows = "".join(f"<tr><th scope='row'>{esc(k)}</th><td>{esc(v)}</td></tr>" for k, v in specs)
    sim = "".join(car_card(c, "sale" if car["focus"] == "sale" else "rent", preview) for c in similar)
    focus_note = "This page leads with the sale asking price." if car["focus"] == "sale" else "This page leads with the daily rental rate."
    return f"""
<main id="main">
  <div class="page-hero">
    <div class="container">
      <p class="crumbs"><a href="index.html">Home</a> / <a href="fleet.html">Fleet</a> / {esc(name_of(car))}</p>
      <h1>{esc(name_of(car))}</h1>
      <p>{esc(car['type'])} · {car['seats']} seats · {esc(car['transmission'])} · {esc(car['fuel'])}. {focus_note}</p>
    </div>
  </div>
  <div class="container detail-layout">
    <div>
      <!--
        DETAIL PAGE TEMPLATE
        To add a car: add it to data/cars.json, then duplicate this file as car-detail-YOUR-SLUG.html
        and replace the slug, copy, prices, and image paths — or run python3 tools/generate_site.py.
        Replace photos in assets/images/cars/. Unsplash fallbacks are data-fallback URLs.
        Form endpoint: assets/js/main.js CONFIG.formspreeEndpoint.
        Contact: {EMAIL} · {PHONE} · {OFFICE_SHORT}.
      -->
      <div class="gallery" data-gallery tabindex="0" aria-label="Photos of {esc(name_of(car))}">
        <div class="gallery__main">
          {img_tag(car['slug'], 1, alt, eager=True, sizes="(max-width: 900px) 100vw, 720px").replace('<img ', '<img data-gallery-main ')}
          <div class="gallery__nav">
            <button type="button" data-prev aria-label="Previous photo">‹</button>
            <button type="button" data-next aria-label="Next photo">›</button>
          </div>
        </div>
        <div class="thumbs">{''.join(thumbs)}</div>
      </div>
      <h2>About this car</h2>
      <p>{esc(car['description'])}</p>
      <h2>Specifications</h2>
      <table class="specs">{spec_rows}</table>
      <h2>Features</h2>
      <ul class="feature-pills">{features}</ul>
      <h2>Similar cars</h2>
      <div class="similar-row" aria-label="Similar cars">{sim}</div>
    </div>
    {booking_box(car)}
  </div>
</main>
"""


def about_body():
    return f"""
<main id="main">
  <div class="page-hero"><div class="container">
    <p class="crumbs"><a href="index.html">Home</a> / About</p>
    <h1>The Daulatpur desk</h1>
    <p>Car rental and car sales from one yard in Khulna. Call {PHONE} or email {EMAIL}.</p>
  </div></div>
  <section class="section">
    <div class="container split">
      <img src="assets/images/about.jpg" alt="Yard and office building in Daulatpur, Khulna" width="1408" height="768">
      <div class="prose">
        <p class="eyebrow">About</p>
        <h2>Head office in Daulatpur, Khulna</h2>
        <p>Daulat Drive keeps a short list of cars for hire and for sale. The point of a short list is that you can ask to see the car, not a photograph of a car we do not have keys for.</p>
        <p>The eight vehicles on this website are a demo dataset so the pages, filters, and booking request can be reviewed. Replace them with your own yard before you advertise the site. The address, email, and phone below are the ones this build was asked to publish.</p>
        <ul class="check-list">
          <li>{CHECK}<span>Address: {OFFICE}</span></li>
          <li>{CHECK}<span>Email: <a href="mailto:{EMAIL}">{EMAIL}</a></span></li>
          <li>{CHECK}<span>Phone: <a href="tel:{PHONE_TEL}">{PHONE}</a></span></li>
          <li>{CHECK}<span>Hours: open daily, 8:00–21:00</span></li>
        </ul>
      </div>
    </div>
  </section>
  <section class="section section--bg">
    <div class="container contact-grid">
      <div>
        <h2>Find the office</h2>
        <p>The map is centred on Daulatpur, Khulna ({LAT}, {LNG}).</p>
        <iframe class="map-frame" title="Google Map of Daulat Drive head office in Daulatpur, Khulna" src="{MAP_EMBED}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        <p><a href="{MAP_DIR}" rel="noopener">Open directions in Google Maps</a></p>
      </div>
      <div class="info-card">
        <h2>What to bring</h2>
        <ul class="check-list">
          <li>{CHECK}<span>Driving licence for every named driver.</span></li>
          <li>{CHECK}<span>NID or passport.</span></li>
          <li>{CHECK}<span>A deposit, agreed before the keys leave the desk.</span></li>
        </ul>
        <p>Self-drive stays inside Khulna Division unless we approve a longer trip in writing. A driver is 1,500 BDT/day.</p>
        <a class="btn btn-primary" href="contact.html">Contact the desk</a>
      </div>
    </div>
  </section>
</main>
"""


def contact_body():
    return f"""
<main id="main">
  <div class="page-hero"><div class="container">
    <p class="crumbs"><a href="index.html">Home</a> / Contact</p>
    <h1>Contact the head office</h1>
    <p>{OFFICE}. Email {EMAIL}. Phone {PHONE}. Open daily 8:00–21:00.</p>
  </div></div>
  <section class="section">
    <div class="container contact-grid">
      <div>
        <h2>Send a message</h2>
        <form data-booking-form data-intent="contact" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
          <input type="hidden" name="intent" value="contact">
          <input type="hidden" name="_subject" value="Daulat Drive contact">
          <div class="form-grid">
            <label>Name<input name="name" autocomplete="name" required></label>
            <label>Email<input name="email" type="email" autocomplete="email" required></label>
            <label>Phone<input name="phone" type="tel" autocomplete="tel" required></label>
            <label>Message<textarea name="message" required placeholder="Tell us the car, the dates, or the question."></textarea></label>
            <ul class="error-list" data-errors role="alert"></ul>
            <button class="btn btn-primary" type="submit" data-submit data-set-intent="contact">Send message</button>
            <p class="help">Posts to Formspree when configured. Otherwise your email app opens a message to <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>
          </div>
        </form>
      </div>
      <div>
        <div class="info-card">
          <h2>Daulatpur, Khulna</h2>
          <p>{OFFICE}</p>
          <p><a href="mailto:{EMAIL}">{EMAIL}</a><br><a href="tel:{PHONE_TEL}">{PHONE}</a><br><a href="{WA}" rel="noopener">WhatsApp</a></p>
          <p>Open daily, 8:00–21:00.</p>
        </div>
        <iframe class="map-frame" title="Google Map centred on Daulatpur, Khulna" src="{MAP_EMBED}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="margin-top:16px"></iframe>
        <p><a href="{MAP_DIR}" rel="noopener">Get directions</a></p>
      </div>
    </div>
  </section>
</main>
"""


def faq_body():
    items = "".join(f'<details class="faq"><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in FAQ)
    return f"""
<main id="main">
  <div class="page-hero"><div class="container">
    <p class="crumbs"><a href="index.html">Home</a> / FAQ</p>
    <h1>Frequently asked questions</h1>
    <p>Rental papers, kilometres, fuel, and how a sale enquiry works. Still stuck? Call {PHONE}.</p>
  </div></div>
  <section class="section"><div class="container prose"><div class="faq-list">{items}</div></div></section>
</main>
"""


def terms_body():
    return f"""
<main id="main">
  <div class="page-hero"><div class="container">
    <p class="crumbs"><a href="index.html">Home</a> / Terms</p>
    <h1>Rental &amp; sale terms</h1>
    <p>Plain terms for hires and sale enquiries at {OFFICE_SHORT}. Email {EMAIL}.</p>
  </div></div>
  <section class="section"><div class="container prose">
    <h2>1. A request is not a contract</h2>
    <p>Sending the form, or an email to {EMAIL}, asks the desk to call you. The hire starts only when we confirm the car, the dates, the driver, and the deposit.</p>
    <h2>2. Who may drive</h2>
    <p>Named drivers must be 21 or older, hold a valid licence, and show NID or a passport. The BMW is 25+ or with a chauffeur. Extra drivers must be listed before pickup.</p>
    <h2>3. Price</h2>
    <p>Daily rates are in BDT and exclude fuel. The website estimate is days × the daily rate, plus 1,500 BDT per day if you add a driver. Jashore Airport delivery is quoted separately, from 2,500 BDT. Sale figures such as 12,50,000 BDT are asking prices, not an online payment.</p>
    <h2>4. Fuel, kilometres, area</h2>
    <p>Fuel is full-to-full. 150 km per day is included inside Khulna Division. Extra kilometres and trips outside the division are agreed in writing before you leave.</p>
    <h2>5. Deposit, damage, late return</h2>
    <p>A refundable deposit is taken at the desk. You are responsible for traffic fines and for damage beyond normal use. Tell the desk and the police about any crash. Do not admit liability on our behalf. Late returns are charged at the hourly rate on your slip after a short grace period.</p>
    <h2>6. Cancellation</h2>
    <p>More than 24 hours before pickup, you may cancel or move the dates at no charge. Inside 24 hours, one day's hire may be kept. Call {PHONE}.</p>
    <h2>7. Sale enquiries</h2>
    <p>Buying is completed at the yard after you inspect the car and the papers. Online enquiry does not reserve the car against another buyer unless we say so by phone.</p>
    <p>Questions: {EMAIL} · {PHONE} · {OFFICE}.</p>
  </div></section>
</main>
"""


def privacy_body():
    return f"""
<main id="main">
  <div class="page-hero"><div class="container">
    <p class="crumbs"><a href="index.html">Home</a> / Privacy</p>
    <h1>Privacy</h1>
    <p>What the forms on this site collect, and what we do with it.</p>
  </div></div>
  <section class="section"><div class="container prose">
    <h2>What we collect</h2>
    <p>If you send a reservation, sale enquiry, or contact message, we receive the fields you typed: name, email, phone, pickup location, dates, the car you chose, and your message. The confirmation page stores that summary in your browser's session storage so you can read it back. It is not written to a database on this static site.</p>
    <h2>Why</h2>
    <p>We use it to call you about a car, prepare papers, and keep a record of the request. We do not sell the list. We do not use it for unrelated advertising.</p>
    <h2>Where it goes</h2>
    <p>When a Formspree endpoint is configured, the form is posted there and forwarded to {EMAIL}. Until then, the site opens a mailto link to {EMAIL} so the message stays in your own email app. Do not put card numbers in the message. This demo does not take card payments.</p>
    <h2>How long</h2>
    <p>Enquiry emails are kept long enough to complete the hire or the sale, and for any dispute about that booking, then deleted. Session storage clears when you close the tab, depending on your browser.</p>
    <h2>Your request</h2>
    <p>To ask what we hold, or to ask us to delete an enquiry, email {EMAIL} or call {PHONE}. Head office: {OFFICE}.</p>
    <h2>Payments note</h2>
    <!-- Optional card checkout: use a tokenised processor (Stripe or a local gateway). Never paste secret keys into this static site. See README. -->
    <p>Online card checkout is not enabled. If it is added later, card data must go to the payment provider, not into these HTML files.</p>
  </div></section>
</main>
"""


def confirmation_body():
    return f"""
<main id="main">
  <div class="confirm-wrap">
    <article class="confirm-card" data-confirmation>
      <p class="eyebrow">Daulat Drive</p>
      <h1>Request received</h1>
      <p data-confirm-lead>If you just sent a form, the summary below is saved in this browser. The desk still has to confirm by phone. This page is not itself a booking.</p>
      <dl>
        <dt>Name</dt><dd data-confirm="name">—</dd>
        <dt>Email</dt><dd data-confirm="email">—</dd>
        <dt>Phone</dt><dd data-confirm="phone">—</dd>
        <dt>Car</dt><dd data-confirm="car">—</dd>
        <dt>Location</dt><dd data-confirm="location">{OFFICE_SHORT}</dd>
        <dt>When</dt><dd data-confirm="when">—</dd>
        <dt>Estimate</dt><dd data-confirm="total">—</dd>
      </dl>
      <p>We reply from {EMAIL} or {PHONE}. Head office: {OFFICE}.</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="tel:{PHONE_TEL}">Call {PHONE}</a>
        <a class="btn btn-outline" href="index.html">Back to the yard</a>
        <button class="btn btn-outline" type="button" onclick="window.print()">Print</button>
      </div>
      <p class="help">If your email app did not open, write to <a href="mailto:{EMAIL}">{EMAIL}</a> with the car and dates.</p>
    </article>
  </div>
</main>
"""


def admin_body():
    return f"""
<main id="main" class="admin-wrap">
  <div class="container">
    <p class="eyebrow">Optional mockup</p>
    <h1>Desk board</h1>
    <p class="notice">Static sample only. Not linked in the public menu. Do not paste real customer data into a file you deploy. There is no login — do not treat this page as an admin system.</p>
    <!-- Stripe / local gateway: tokenise cards in the provider's hosted field. Never store secret keys in this HTML. Activation notes are in README. -->
    <div class="admin-stats">
      <div class="admin-stat"><strong>3</strong><span>sample requests</span></div>
      <div class="admin-stat"><strong>1</strong><span>reserved car</span></div>
      <div class="admin-stat"><strong>8</strong><span>demo vehicles</span></div>
      <div class="admin-stat"><strong>{PHONE}</strong><span>desk phone</span></div>
    </div>
    <div class="table-wrap">
      <table class="data">
        <thead><tr><th>ID</th><th>Name</th><th>Car</th><th>When</th><th>Estimate</th><th>Status</th></tr></thead>
        <tbody data-admin-body"></tbody>
      </table>
    </div>
    <p class="help">Sample rows load from <code>data/bookings-sample.json</code>. <a href="index.html">Return to the site</a>.</p>
  </div>
</main>
"""


def wrap(title, description, filename, active, body, extra_ld=None, preview=False):
    blocks = [business_ld()]
    if extra_ld:
        blocks.extend(extra_ld if isinstance(extra_ld, list) else [extra_ld])
    html = chrome_open(title, description, filename, active, blocks, preview=preview)
    html += body
    html += footer(preview=preview)
    html += modal()
    html += scripts(preview=preview)
    return html


def write(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    print("wrote", path.relative_to(ROOT))


def build_preview():
    css = (ROOT / "assets/css/styles.css").read_text(encoding="utf-8")
    css = css.replace('url("../images/', 'url("assets/images/')
    js = (ROOT / "assets/js/main.js").read_text(encoding="utf-8")
    cars = [public_car(c) for c in CARS]
    featured_and_rest = home_main(preview=True)
    fleet = listing_page("rent", preview=True).replace("<main id=\"main\">", '<section id="fleet">').replace("</main>", "</section>")
    sale = listing_page("sale", preview=True).replace("<main id=\"main\">", '<section id="sale">').replace("</main>", "</section>")
    # home_main already includes <main>. For preview, keep one main and add sections.
    home = featured_and_rest.replace("<main id=\"main\">", '<main id="main">').replace("</main>", "")
    about = """
<section class="section" id="about">
  <div class="container split">
    <img src="assets/images/about.jpg" alt="Yard in Daulatpur, Khulna" width="1408" height="768">
    <div>
      <p class="eyebrow">About</p>
      <h2>Head office — Daulatpur, Khulna</h2>
      <p>%s. Email <a href="mailto:%s">%s</a>. Phone <a href="tel:%s">%s</a>. Open daily 8:00–21:00.</p>
      <p>This single file is the quick preview. The multi-page site (index.html, fleet.html, car detail pages) is what you deploy.</p>
    </div>
  </div>
</section>
""" % (OFFICE, EMAIL, EMAIL, PHONE_TEL, PHONE)
    contact = f"""
<section class="section section--bg" id="contact">
  <div class="container contact-grid">
    <div>
      <h2>Contact</h2>
      <form data-booking-form data-intent="contact" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
        <input type="hidden" name="intent" value="contact">
        <div class="form-grid">
          <label>Name<input name="name" required></label>
          <label>Email<input name="email" type="email" required></label>
          <label>Phone<input name="phone" type="tel" required></label>
          <label>Message<textarea name="message" required></textarea></label>
          <ul class="error-list" data-errors role="alert"></ul>
          <button class="btn btn-primary" type="submit" data-set-intent="contact">Send message</button>
        </div>
      </form>
    </div>
    <div>
      <iframe class="map-frame" title="Google Map centred on Daulatpur, Khulna" src="{MAP_EMBED}" loading="lazy"></iframe>
      <p><a href="{MAP_DIR}">Directions to Daulatpur, Khulna</a></p>
    </div>
  </div>
</section>
<section id="preview-detail" class="section" hidden></section>
"""
    body = home + fleet + sale + about + contact + "</main>"
    page = chrome_open(
        "Daulat Drive preview — car rental & sales, Daulatpur, Khulna",
        "Single-file preview of Daulat Drive. Browse hire cars and cars for sale, filter the fleet, and send a reservation request.",
        "index_preview.html",
        "home",
        [business_ld()],
        preview=True,
    )
    page = page.replace("</head>", "<style>\n" + css + "\n</style>\n</head>", 1)
    page += body
    page += footer(preview=True)
    page += modal()
    page += "<script>window.DAULAT_CARS = " + json.dumps(cars, ensure_ascii=False) + ";</script>\n"
    page += "<script>\n" + js + "\n</script>\n</body>\n</html>\n"
    return page


def main():
    cars_out = [public_car(c) for c in CARS]
    write(ROOT / "data/cars.json", json.dumps(cars_out, ensure_ascii=False, indent=2) + "\n")
    write(ROOT / "data/cars.js", "/* file:// fallback. Regenerate with tools/generate_site.py */\nwindow.DAULAT_CARS_FALLBACK = " + json.dumps(cars_out, ensure_ascii=False) + ";\n")
    i18n = {
        "en": {"brand": "Daulat Drive", "office": OFFICE},
        "bn": {
            "nav_home": "হোম",
            "nav_fleet": "ভাড়ার গাড়ি",
            "nav_sale": "বিক্রয়",
            "nav_about": "আমাদের সম্পর্কে",
            "nav_faq": "প্রশ্নোত্তর",
            "nav_contact": "যোগাযোগ",
            "nav_book": "গাড়ি বুক করুন",
            "hero_kicker": "দৌলতপুর ইয়ার্ড · খুলনা",
            "hero_title": "নির্ভরযোগ্য গাড়ি ভাড়া ও বিক্রয় — দৌলতপুর, খুলনা",
            "hero_sub": "দৌলতপুর ইয়ার্ড থেকে দৈনিক ও সাপ্তাহিক ভাড়া, এবং যাচাই করা গাড়ি বিক্রয়। ভাড়া বাংলাদেশি টাকায়।",
            "search": "গাড়ি খুঁজুন",
            "view": "বিস্তারিত",
            "book": "বুক করুন",
            "enquire": "কিনতে জানুন",
            "office": "দৌলতপুর, খুলনা ৯২০২, বাংলাদেশ",
        },
    }
    write(ROOT / "data/i18n.json", json.dumps(i18n, ensure_ascii=False, indent=2) + "\n")
    bookings = [
        {"id": "BD-2401", "name": "Sample — Farhana R.", "car": "Toyota Premio 2019", "when": "12 Apr 2026, 09:00 → 14 Apr 2026, 09:00", "total": "10,500 BDT", "status": "Requested"},
        {"id": "BD-2402", "name": "Sample — Office shift", "car": "Toyota Hiace 2015", "when": "18 Apr 2026 with driver", "total": "27,000 BDT", "status": "Confirmed"},
        {"id": "BD-2403", "name": "Sample — Imran K.", "car": "Toyota Axio 2018", "when": "Sale enquiry", "total": "11,00,000 BDT asking", "status": "Desk to call"},
    ]
    write(ROOT / "data/bookings-sample.json", json.dumps(bookings, ensure_ascii=False, indent=2) + "\n")

    pages = {
        "index.html": wrap(
            "Daulat Drive — Car rental & sales in Daulatpur, Khulna",
            "Hire a car or ask about buying one from the Daulatpur, Khulna yard. Daily rates and asking prices in BDT. Call +8801330132141.",
            "index.html", "home", home_main(False),
        ),
        "fleet.html": wrap(
            "Rental fleet — Daulat Drive, Khulna",
            "Filter sedans, SUVs, a hatchback, and a microbus for hire in Khulna. Daily rates in BDT.",
            "fleet.html", "fleet", listing_page("rent"),
        ),
        "sale.html": wrap(
            "Cars for sale — Daulat Drive, Daulatpur",
            "Inspected cars for sale in Daulatpur, Khulna. Asking prices in BDT, including 12,50,000 and 50,00,000.",
            "sale.html", "sale", listing_page("sale"),
        ),
        "about.html": wrap(
            "About — Daulat Drive, Daulatpur, Khulna",
            "Head office of Daulat Drive in Daulatpur, Khulna 9202. Phone +8801330132141. Email mail@gmail.com.",
            "about.html", "about", about_body(),
        ),
        "contact.html": wrap(
            "Contact — Daulat Drive, Daulatpur, Khulna",
            "Contact the Daulatpur, Khulna head office. Map, phone +8801330132141, email mail@gmail.com.",
            "contact.html", "contact", contact_body(),
        ),
        "faq.html": wrap(
            "FAQ — Daulat Drive car rental, Khulna",
            "Licence, deposit, kilometres, fuel, cancellation, and sale prices for Daulat Drive in Khulna.",
            "faq.html", "faq", faq_body(),
        ),
        "terms.html": wrap(
            "Terms — Daulat Drive",
            "Rental and sale terms for Daulat Drive, Daulatpur, Khulna.",
            "terms.html", "", terms_body(),
        ),
        "privacy.html": wrap(
            "Privacy — Daulat Drive",
            "How Daulat Drive handles names, phone numbers, and booking requests sent from this site.",
            "privacy.html", "", privacy_body(),
        ),
        "booking-confirmation.html": wrap(
            "Request received — Daulat Drive",
            "Your reservation or enquiry request is ready for the Daulatpur desk to confirm.",
            "booking-confirmation.html", "", confirmation_body(),
        ),
        "404.html": wrap(
            "Page not found — Daulat Drive",
            "That page is not on the Daulat Drive site.",
            "404.html", "",
            f'<main id="main" class="section"><div class="container"><h1>That page is not here</h1><p>Try the fleet, or call {PHONE}.</p><a class="btn btn-primary" href="index.html">Back home</a></div></main>',
        ),
    }
    admin = wrap(
        "Desk board (sample) — Daulat Drive",
        "Static sample desk board. Not a real admin system.",
        "admin.html", "", admin_body(),
    )
    admin = admin.replace(
        "</body>",
        "<script>window.DAULAT_BOOKINGS = " + json.dumps(bookings) + ";</script>\n</body>",
    )
    # fix accidental quote in tbody from my template
    admin = admin.replace('<tbody data-admin-body"></tbody>', '<tbody data-admin-body></tbody>')
    pages["admin.html"] = admin

    for filename, html in pages.items():
        write(ROOT / filename, html)

    for car in CARS:
        html = wrap(
            f"{name_of(car)} — rent or buy | Daulat Drive, Khulna",
            f"{name_of(car)} in {car['color']}. Hire from {fmt_daily_num(car['rental_rate_per_day'])} BDT/day or ask about buying at {fmt_sale(car['sale_price'])}. Daulatpur, Khulna.",
            f"car-detail-{car['slug']}.html",
            "",
            detail_page(car),
            extra_ld=vehicle_ld(car),
        )
        write(ROOT / f"car-detail-{car['slug']}.html", html)

    template = """<!--
car-detail-TEMPLATE.html
Copy to car-detail-YOUR-SLUG.html after you add the car to data/cars.json.
Required visible contact: mail@gmail.com, +8801330132141, Daulatpur, Khulna.
Prefer: python3 tools/generate_site.py
Replace images: assets/images/cars/YOUR-SLUG-1.jpg (plus -2 and -3).
Unsplash placeholders belong in data/cars.json images[] and img data-fallback.
Form endpoint: assets/js/main.js → CONFIG.formspreeEndpoint
-->
""" + wrap(
        "Template car — Daulat Drive",
        "Template detail page. Duplicate this file for a new car.",
        "car-detail-TEMPLATE.html",
        "",
        detail_page(CARS[0]).replace("toyota-premio-2019", "YOUR-SLUG"),
        extra_ld=vehicle_ld(CARS[0]),
    )
    write(ROOT / "car-detail-TEMPLATE.html", template)
    write(ROOT / "index_preview.html", build_preview())

    sitemap_pages = [
        "index.html", "fleet.html", "sale.html", "about.html", "contact.html",
        "faq.html", "terms.html", "privacy.html",
    ] + [f"car-detail-{c['slug']}.html" for c in CARS]
    urls = "\n".join(
        f"  <url><loc>https://YOUR_DOMAIN/{name}</loc></url>" for name in sitemap_pages
    )
    write(ROOT / "sitemap.xml", f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>
""")
    write(ROOT / "robots.txt", "User-agent: *\nAllow: /\nDisallow: /admin.html\nSitemap: https://YOUR_DOMAIN/sitemap.xml\n")
    write(ROOT / "site.webmanifest", json.dumps({
        "name": "Daulat Drive",
        "short_name": "Daulat Drive",
        "description": "Car rental and sales in Daulatpur, Khulna",
        "start_url": "./index.html",
        "display": "standalone",
        "background_color": "#071427",
        "theme_color": "#0b6efd",
        "lang": "en",
        "icons": [
            {"src": "assets/images/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "assets/images/icon-512.png", "sizes": "512x512", "type": "image/png"},
        ],
    }, indent=2) + "\n")
    print("done")


if __name__ == "__main__":
    main()
