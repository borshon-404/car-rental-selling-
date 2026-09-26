/* Daulat Drive site behaviour.
   REPLACE the Formspree endpoint below before going live.
   Contact fallback: mail@gmail.com  |  Phone: +8801330132141
   Car data: data/cars.json (fetch) with data/cars.js fallback for file:// opens. */
(function () {
  "use strict";

  var CONFIG = {
    /* Replace YOUR_FORM_ID with the id from https://formspree.io (form action ends in /f/xxxxxxxx). */
    formspreeEndpoint: "https://formspree.io/f/YOUR_FORM_ID",
    contactEmail: "mail@gmail.com",
    phoneTel: "+8801330132141",
    phoneDisplay: "+8801330132141",
    office: "Daulatpur, Khulna 9202, Bangladesh",
    driverPerDay: 1500
  };

  var I18N = {
    en: {
      nav_home: "Home",
      nav_fleet: "Fleet",
      nav_sale: "For Sale",
      nav_about: "About",
      nav_faq: "FAQ",
      nav_contact: "Contact",
      nav_book: "Book a Car",
      hero_kicker: "Daulatpur yard · Khulna",
      hero_title: "Reliable Car Rental & Sales — Daulatpur, Khulna",
      hero_sub: "Daily and weekly hires from the Daulatpur yard, plus inspected cars for sale. Rates in BDT. Call to confirm a car is on the lot.",
      search: "Search fleet",
      view: "View Details",
      book: "Book",
      enquire: "Enquire to Buy",
      call: "Call"
    },
    bn: {
      nav_home: "হোম",
      nav_fleet: "ভাড়ার গাড়ি",
      nav_sale: "বিক্রয়",
      nav_about: "আমাদের সম্পর্কে",
      nav_faq: "প্রশ্নোত্তর",
      nav_contact: "যোগাযোগ",
      nav_book: "গাড়ি বুক করুন",
      hero_kicker: "দৌলতপুর ইয়ার্ড · খুলনা",
      hero_title: "নির্ভরযোগ্য গাড়ি ভাড়া ও বিক্রয় — দৌলতপুর, খুলনা",
      hero_sub: "দৌলতপুর ইয়ার্ড থেকে দৈনিক ও সাপ্তাহিক ভাড়া, এবং যাচাই করা গাড়ি বিক্রয়। ভাড়া বাংলাদেশি টাকায়। গাড়ি আছে কিনা ফোনে নিশ্চিত করুন।",
      search: "গাড়ি খুঁজুন",
      view: "বিস্তারিত",
      book: "বুক করুন",
      enquire: "কিনতে জানুন",
      call: "কল"
    }
  };

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function formatDaily(n) {
    return Number(n).toLocaleString("en-US") + " BDT/day";
  }
  function formatSale(n) {
    var s = String(Math.round(Number(n)));
    if (s.length <= 3) return s + " BDT";
    var last = s.slice(-3);
    var rest = s.slice(0, -3);
    var parts = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) parts.unshift(rest);
    return parts.join(",") + "," + last + " BDT";
  }
  function rentalDays(pickupDate, pickupTime, returnDate, returnTime) {
    if (!pickupDate || !returnDate) return 0;
    var start = new Date(pickupDate + "T" + (pickupTime || "09:00"));
    var end = new Date(returnDate + "T" + (returnTime || "09:00"));
    var diff = end - start;
    if (!(diff > 0)) return 0;
    return Math.max(1, Math.ceil(diff / 86400000));
  }
  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }
  function endpointReady() {
    return CONFIG.formspreeEndpoint && CONFIG.formspreeEndpoint.indexOf("YOUR_FORM_ID") === -1;
  }

  function cardMarkup(car, mode) {
    var name = car.make + " " + car.model;
    var href = "/car-detail-" + car.slug + ".html";
    var img = (car.local_images && car.local_images[0]) || (car.images && car.images[0]) || "/assets/images/hero.jpg";
    if (img.charAt(0) !== "/" && img.indexOf("http") !== 0) img = "/" + img;
    var status = car.availability_status === "available" ? "Available" : "Reserved";
    var badge = car.availability_status === "available" ? "badge--ok" : "badge--no";
    var price = mode === "sale"
      ? formatSale(car.sale_price).replace(" BDT", "") + " <small>BDT</small>"
      : Number(car.rental_rate_per_day).toLocaleString("en-US") + " <small>BDT/day</small>";
    var note = mode === "sale" ? "Rent " + formatDaily(car.rental_rate_per_day) : "Sale " + formatSale(car.sale_price);
    var intent = mode === "sale" ? "sale" : "rent";
    var action = mode === "sale" ? "Enquire to Buy" : "Book";
    return '<article class="car-card" data-slug="' + car.slug + '" data-name="' + name + '" data-type="' + car.type + '" data-segment="' + (car.segment || "") + '" data-seats="' + car.seats + '" data-transmission="' + car.transmission + '" data-fuel="' + car.fuel + '" data-rate="' + car.rental_rate_per_day + '" data-sale="' + car.sale_price + '" data-status="' + car.availability_status + '" data-year="' + car.year + '">' +
      '<a class="car-card__media" href="' + href + '"><img src="' + img + '" alt="' + car.year + " " + name + '" loading="lazy"><span class="car-card__badges"><span class="badge ' + badge + '">' + status + '</span></span></a>' +
      '<div class="car-card__body"><p class="car-card__kicker">' + car.type + " · " + car.year + " · " + (car.color || "") + '</p><h3><a href="' + href + '">' + name + '</a></h3>' +
      '<ul class="spec-row"><li>' + car.seats + ' seats</li><li>' + car.transmission + '</li><li>' + car.fuel + '</li></ul>' +
      '<div class="price-row"><p class="price">' + price + '</p><p class="sale-note">' + note + '</p></div>' +
      '<div class="car-card__actions"><a class="btn btn-primary" href="' + href + '">View Details</a>' +
      '<button class="btn btn-accent" type="button" data-open-booking data-slug="' + car.slug + '" data-intent="' + intent + '">' + action + '</button></div></div></article>';
  }

  function refreshGrids(cars) {
    qsa("[data-car-grid]").forEach(function (grid) {
      var mode = grid.getAttribute("data-car-grid") || "rent";
      var list = cars.filter(function (car) {
        if (mode === "home-sale" || mode === "sale") return Number(car.sale_price) > 0;
        if (mode === "home-rent") return car.focus !== "sale";
        return true;
      });
      if (mode === "home-sale") list = list.slice(0, 4);
      if (!list.length) return;
      grid.innerHTML = list.map(function (car) { return cardMarkup(car, mode.indexOf("sale") !== -1 ? "sale" : "rent"); }).join("");
    });
  }

  function loadCars() {
    return fetch("/api/public/cars", { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("api");
        return res.json();
      })
      .then(function (data) {
        var cars = Array.isArray(data) ? data : [];
        if (!cars.length) throw new Error("empty");
        refreshGrids(cars);
        return cars;
      })
      .catch(function () {
        if (window.DAULAT_CARS && window.DAULAT_CARS.length) return window.DAULAT_CARS;
        return fetch("data/cars.json", { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("cars.json unavailable");
        return res.json();
      })
      .then(function (data) {
        return Array.isArray(data) ? data : (data.cars || []);
      })
      .catch(function () {
          return window.DAULAT_CARS_FALLBACK || [];
        });
      });
  }

  function carBySlug(cars, slug) {
    for (var i = 0; i < cars.length; i++) {
      if (cars[i].slug === slug || cars[i].id === slug) return cars[i];
    }
    return null;
  }

  /* Header, menu, language */
  function initChrome() {
    var head = qs(".site-head");
    var toggle = qs(".nav-toggle");
    var nav = qs("#site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      qsa("#site-nav a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
    if (head) {
      var onScroll = function () {
        head.classList.toggle("is-stuck", window.scrollY > 8);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
    qsa("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang"));
      });
    });
    applyLang(localStorage.getItem("daulat-lang") || "en");
    qsa("img[data-fallback]").forEach(function (img) {
      img.addEventListener("error", function () {
        if (img.getAttribute("data-fellback") === "1") return;
        img.setAttribute("data-fellback", "1");
        img.src = img.getAttribute("data-fallback");
      });
    });
    var heroSearch = qs("#hero-search");
    if (heroSearch && document.body.getAttribute("data-preview") === "true") {
      heroSearch.addEventListener("submit", function (event) {
        event.preventDefault();
        var data = new FormData(heroSearch);
        var fleetForm = qs('#fleet [data-filter-form]');
        if (fleetForm && data.get("type") && fleetForm.elements.type) {
          fleetForm.elements.type.value = data.get("type");
          fleetForm.dispatchEvent(new Event("input", { bubbles: true }));
        }
        try {
          if (data.get("location")) sessionStorage.setItem("daulat-location", data.get("location"));
          if (data.get("pickup")) sessionStorage.setItem("daulat-pickup", data.get("pickup"));
          if (data.get("return")) sessionStorage.setItem("daulat-return", data.get("return"));
        } catch (err) {}
        var fleet = qs("#fleet");
        if (fleet) fleet.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function applyLang(lang) {
    if (!I18N[lang]) lang = "en";
    localStorage.setItem("daulat-lang", lang);
    document.documentElement.lang = lang === "bn" ? "bn" : "en";
    var dict = I18N[lang];
    qsa("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
    qsa("[data-lang]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });
    var extra = window.DAULAT_I18N && window.DAULAT_I18N[lang];
    if (extra) {
      Object.keys(extra).forEach(function (key) {
        qsa('[data-i18n="' + key + '"]').forEach(function (el) {
          el.textContent = extra[key];
        });
      });
    }
  }

  /* Dates */
  function initDates(root) {
    var today = todayISO();
    qsa('input[type="date"]', root || document).forEach(function (input) {
      if (!input.min) input.min = today;
      input.addEventListener("change", function () {
        var form = input.form;
        if (!form) return;
        var pickup = qs('input[name="pickup"]', form);
        var ret = qs('input[name="return"]', form);
        if (pickup && ret && pickup.value) ret.min = pickup.value;
      });
    });
  }

  /* Fleet / sale filters — cards are pre-rendered; JS hides and sorts them. */
  function initListing() {
    qsa("[data-filter-form]").forEach(initOneListing);
  }

  function initOneListing(form) {
    var grid = qs("[data-car-grid]", form);
    if (!grid) return;
    var countEl = qs("[data-result-count]", form);
    var empty = qs("[data-empty]", form);
    var cards = qsa(".car-card", grid);
    var params = new URLSearchParams(window.location.search);

    function val(name) {
      var el = form ? form.elements[name] : null;
      return el ? el.value : "";
    }

    if (form) {
      ["type", "seats", "transmission", "fuel", "availability", "sort", "q"].forEach(function (name) {
        if (params.get(name) && form.elements[name]) form.elements[name].value = params.get(name);
      });
      if (params.get("max")) {
        var maxInput = form.elements.max;
        if (maxInput) maxInput.value = params.get("max");
      }
      if (params.get("location")) {
        try { sessionStorage.setItem("daulat-location", params.get("location")); } catch (e) {}
      }
      if (params.get("pickup")) {
        try { sessionStorage.setItem("daulat-pickup", params.get("pickup")); } catch (e) {}
      }
      if (params.get("return")) {
        try { sessionStorage.setItem("daulat-return", params.get("return")); } catch (e) {}
      }
    }

    function apply() {
      var type = val("type");
      var seats = val("seats");
      var transmission = val("transmission");
      var fuel = val("fuel");
      var availability = val("availability");
      var q = (val("q") || "").trim().toLowerCase();
      var max = Number(val("max") || 0);
      var mode = grid.getAttribute("data-car-grid");
      var sort = val("sort") || "featured";
      var shown = [];

      cards.forEach(function (card) {
        var ok = true;
        if (type && type !== "all") {
          if (type === "Luxury") ok = card.getAttribute("data-segment") === "Luxury";
          else ok = card.getAttribute("data-type") === type;
        }
        if (ok && seats && seats !== "all" && card.getAttribute("data-seats") !== seats) ok = false;
        if (ok && transmission && transmission !== "all" && card.getAttribute("data-transmission") !== transmission) ok = false;
        if (ok && fuel && fuel !== "all" && card.getAttribute("data-fuel") !== fuel) ok = false;
        if (ok && availability === "available" && card.getAttribute("data-status") !== "available") ok = false;
        if (ok && q) {
          var hay = (card.getAttribute("data-name") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year")).toLowerCase();
          if (hay.indexOf(q) === -1) ok = false;
        }
        if (ok && max) {
          var price = mode === "sale" ? Number(card.getAttribute("data-sale")) : Number(card.getAttribute("data-rate"));
          if (price > max) ok = false;
        }
        card.hidden = !ok;
        if (ok) shown.push(card);
      });

      shown.sort(function (a, b) {
        if (sort === "price-asc") {
          var pa = mode === "sale" ? Number(a.getAttribute("data-sale")) : Number(a.getAttribute("data-rate"));
          var pb = mode === "sale" ? Number(b.getAttribute("data-sale")) : Number(b.getAttribute("data-rate"));
          return pa - pb;
        }
        if (sort === "price-desc") {
          var pda = mode === "sale" ? Number(a.getAttribute("data-sale")) : Number(a.getAttribute("data-rate"));
          var pdb = mode === "sale" ? Number(b.getAttribute("data-sale")) : Number(b.getAttribute("data-rate"));
          return pdb - pda;
        }
        if (sort === "year") return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        if (sort === "name") return a.getAttribute("data-name").localeCompare(b.getAttribute("data-name"));
        return 0;
      });
      shown.forEach(function (card) { grid.appendChild(card); });
      cards.filter(function (c) { return c.hidden; }).forEach(function (card) { grid.appendChild(card); });

      if (countEl) {
        countEl.textContent = shown.length + (shown.length === 1 ? " car" : " cars");
      }
      if (empty) empty.hidden = shown.length !== 0;
      var readout = qs("[data-max-readout]", form);
      if (readout && max) {
        readout.textContent = mode === "sale" ? formatSale(max) : formatDaily(max);
      }
    }

    if (form) {
      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("submit", function (e) { e.preventDefault(); apply(); });
      var reset = qs("[data-filter-reset]", form);
      if (reset) {
        reset.addEventListener("click", function () {
          form.reset();
          apply();
        });
      }
    }
    apply();
  }

  /* Booking modal + detail calculator */
  var carsCache = [];

  function fillCarSelect(select, cars, selected) {
    if (!select) return;
    var current = selected || select.value;
    select.innerHTML = "";
    cars.forEach(function (car) {
      var opt = document.createElement("option");
      opt.value = car.slug;
      opt.textContent = car.year + " " + car.make + " " + car.model + " — " + formatDaily(car.rental_rate_per_day);
      if (car.availability_status !== "available") opt.textContent += " (reserved)";
      select.appendChild(opt);
    });
    if (current) select.value = current;
  }

  function updateEstimate(form) {
    if (!form) return;
    var out = qs("[data-estimate]", form) || qs("#booking-estimate");
    var intent = form.getAttribute("data-intent") || (form.elements.intent && form.elements.intent.value) || "rent";
    var slug = form.elements.car ? form.elements.car.value : form.getAttribute("data-slug");
    var car = carBySlug(carsCache, slug);
    var box = qs("[data-unavailable]", form.closest(".booking-box") || form.closest("dialog") || form);
    if (!car) {
      if (intent === "contact") return;
      if (out) out.textContent = "Choose a car to see an estimate.";
      return;
    }
    if (intent === "sale") {
      if (out) out.innerHTML = "Asking price <strong>" + formatSale(car.sale_price) + "</strong>. Negotiation is at the Daulatpur desk, not online.";
      if (box) box.hidden = true;
      var submit = qs("[data-submit]", form);
      if (submit) submit.disabled = false;
      return;
    }
    var blocked = car.availability_status !== "available";
    if (box) box.hidden = !blocked;
    var rentBtn = qs('[data-set-intent="rent"]', form) || qs("[data-submit]", form);
    var saleBtn = qs('[data-set-intent="sale"]', form);
    if (rentBtn) rentBtn.disabled = blocked;
    if (saleBtn) saleBtn.disabled = false;
    var days = rentalDays(
      form.elements.pickup && form.elements.pickup.value,
      form.elements.pickup_time && form.elements.pickup_time.value,
      form.elements["return"] && form.elements["return"].value,
      form.elements.return_time && form.elements.return_time.value
    );
    var driver = form.elements.driver && form.elements.driver.checked;
    var total = days * Number(car.rental_rate_per_day) + (driver && days ? CONFIG.driverPerDay * days : 0);
    if (out) {
      if (!days) {
        out.textContent = "Daily rate " + formatDaily(car.rental_rate_per_day) + ". Choose pickup and return to estimate.";
      } else {
        out.innerHTML = days + " day" + (days > 1 ? "s" : "") + " × " + formatDaily(car.rental_rate_per_day) +
          (driver ? " + driver " + formatDaily(CONFIG.driverPerDay) : "") +
          " = <strong>" + Number(total).toLocaleString("en-US") + " BDT</strong>";
      }
    }
  }

  function showErrors(form, messages) {
    var list = qs("[data-errors]", form);
    if (!list) return;
    list.innerHTML = "";
    messages.forEach(function (msg) {
      var li = document.createElement("li");
      li.textContent = msg;
      list.appendChild(li);
    });
    if (messages.length) list.focus && list.setAttribute("tabindex", "-1");
  }

  function validate(form) {
    var errors = [];
    var intent = (form.elements.intent && form.elements.intent.value) || form.getAttribute("data-intent") || "rent";
    var required = ["name", "email", "phone"];
    if (intent !== "contact") required.push("pickup_location");
    if (intent !== "contact") required.push("car");
    required.forEach(function (name) {
      var el = form.elements[name];
      if (el && !String(el.value || "").trim()) errors.push("Please fill in " + (el.labels && el.labels[0] ? el.labels[0].textContent : name) + ".");
    });
    var email = form.elements.email && form.elements.email.value;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Enter a valid email address.");
    var phone = form.elements.phone && form.elements.phone.value;
    if (phone && phone.replace(/\D/g, "").length < 10) errors.push("Enter a phone number we can call back.");
    if (intent === "rent") {
      if (form.elements.pickup && !form.elements.pickup.value) errors.push("Choose a pickup date.");
      if (form.elements["return"] && !form.elements["return"].value) errors.push("Choose a return date.");
      var days = rentalDays(
        form.elements.pickup && form.elements.pickup.value,
        form.elements.pickup_time && form.elements.pickup_time.value,
        form.elements["return"] && form.elements["return"].value,
        form.elements.return_time && form.elements.return_time.value
      );
      if (form.elements.pickup && form.elements.pickup.value && form.elements["return"] && form.elements["return"].value && days < 1) {
        errors.push("Return must be after pickup.");
      }
      var slug = form.elements.car ? form.elements.car.value : form.getAttribute("data-slug");
      var car = carBySlug(carsCache, slug);
      if (car && car.availability_status !== "available") {
        errors.push("This car is reserved and cannot be booked for rental. Call " + CONFIG.phoneDisplay + " to join the waitlist, or send a sale enquiry.");
      }
    }
    return errors;
  }

  function payloadFrom(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled) return;
      if (el.type === "checkbox") data[el.name] = el.checked;
      else data[el.name] = el.value;
    });
    var slug = data.car || form.getAttribute("data-slug");
    var car = carBySlug(carsCache, slug);
    var intent = data.intent || form.getAttribute("data-intent") || "rent";
    var days = rentalDays(data.pickup, data.pickup_time, data["return"], data.return_time);
    var total = 0;
    if (car && intent !== "sale") {
      total = days * Number(car.rental_rate_per_day);
      if (data.driver) total += CONFIG.driverPerDay * days;
    }
    data.intent = intent;
    data.car_name = car ? (car.year + " " + car.make + " " + car.model) : slug;
    data.days = days;
    data.estimated_total_bdt = total;
    data.sale_price_bdt = car ? car.sale_price : null;
    data.currency = "BDT";
    data.office = CONFIG.office;
    data.submitted_from = location.pathname;
    return data;
  }

  function mailtoFallback(data) {
    var lines = [
      "Daulat Drive request",
      "Type: " + data.intent,
      "Name: " + data.name,
      "Email: " + data.email,
      "Phone: " + data.phone,
      "Car: " + (data.car_name || data.car),
      "Pickup location: " + (data.pickup_location || ""),
      "Pickup: " + (data.pickup || "") + " " + (data.pickup_time || ""),
      "Return: " + (data["return"] || "") + " " + (data.return_time || ""),
      "Days: " + data.days,
      "Estimated total: " + data.estimated_total_bdt + " BDT",
      "Driver: " + (data.driver ? "yes" : "no"),
      "Message: " + (data.message || "")
    ];
    var subject = (data.intent === "sale" ? "Purchase enquiry: " : "Reservation request: ") + (data.car_name || "car");
    var href = "mailto:" + CONFIG.contactEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
    var a = document.createElement("a");
    a.href = href;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function goConfirm() {
    window.location.href = "booking-confirmation.html";
  }

  function bindForm(form) {
    if (!form || form.getAttribute("data-bound") === "1") return;
    form.setAttribute("data-bound", "1");
    qsa("[data-set-intent]", form).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var intent = btn.getAttribute("data-set-intent") || "rent";
        if (form.elements.intent) form.elements.intent.value = intent;
        form.setAttribute("data-intent", intent);
        updateEstimate(form);
      });
    });
    form.addEventListener("input", function () { updateEstimate(form); });
    form.addEventListener("change", function () { updateEstimate(form); });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var errors = validate(form);
      showErrors(form, errors);
      if (errors.length) return;
      var data = payloadFrom(form);
      try { sessionStorage.setItem("daulat-confirmation", JSON.stringify(data)); } catch (e) {}
      var submit = qs("[data-submit]", form) || qs('button[type="submit"]', form);
      if (submit) submit.disabled = true;
      fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error("Desk could not store the request");
        goConfirm();
      }).catch(function () {
        mailtoFallback(data);
        window.setTimeout(goConfirm, 400);
      });
    });
    updateEstimate(form);
  }

  function openModal(slug, intent) {
    var dialog = qs("#booking-modal");
    if (!dialog) {
      window.location.href = "contact.html";
      return;
    }
    var form = qs("#booking-form", dialog);
    if (form.elements.intent) form.elements.intent.value = intent || "rent";
    form.setAttribute("data-intent", intent || "rent");
    if (slug && form.elements.car) form.elements.car.value = slug;
    try {
      var loc = sessionStorage.getItem("daulat-location");
      var pickup = sessionStorage.getItem("daulat-pickup");
      var ret = sessionStorage.getItem("daulat-return");
      if (loc && form.elements.pickup_location && !form.elements.pickup_location.value) form.elements.pickup_location.value = loc;
      if (pickup && form.elements.pickup && !form.elements.pickup.value) form.elements.pickup.value = pickup;
      if (ret && form.elements["return"] && !form.elements["return"].value) form.elements["return"].value = ret;
    } catch (e) {}
    var title = qs("#booking-title");
    if (title) title.textContent = intent === "sale" ? "Enquire to buy" : "Request a reservation";
    qsa("[data-rent-only]", form).forEach(function (el) { el.hidden = intent === "sale"; });
    updateEstimate(form);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    var first = qs("input[name='name']", form);
    if (first) first.focus();
  }

  function initBooking() {
    var dialog = qs("#booking-modal");
    var form = dialog ? qs("#booking-form", dialog) : null;
    if (form) {
      fillCarSelect(form.elements.car, carsCache);
      bindForm(form);
      initDates(form);
    }
    qsa("[data-open-booking]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal(btn.getAttribute("data-slug") || "", btn.getAttribute("data-intent") || "rent");
      });
    });
    qsa("[data-close-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (dialog && dialog.close) dialog.close();
        else if (dialog) dialog.removeAttribute("open");
      });
    });
    if (dialog) {
      dialog.addEventListener("click", function (e) {
        if (e.target === dialog && dialog.close) dialog.close();
      });
    }
    qsa("form[data-booking-form]").forEach(function (inline) {
      bindForm(inline);
      initDates(inline);
    });
  }

  function initGallery() {
    qsa("[data-gallery]").forEach(function (gallery) {
      var main = qs("[data-gallery-main]", gallery);
      var thumbs = qsa("[data-thumb]", gallery);
      var prev = qs("[data-prev]", gallery);
      var next = qs("[data-next]", gallery);
      if (!main || !thumbs.length) return;
      var index = 0;
      function show(i) {
        index = (i + thumbs.length) % thumbs.length;
        var src = thumbs[index].getAttribute("data-full") || thumbs[index].querySelector("img").src;
        var alt = thumbs[index].getAttribute("data-alt") || "";
        main.src = src;
        main.alt = alt;
        thumbs.forEach(function (t, n) { t.setAttribute("aria-current", n === index ? "true" : "false"); });
      }
      thumbs.forEach(function (t, n) {
        t.addEventListener("click", function () { show(n); });
      });
      if (prev) prev.addEventListener("click", function () { show(index - 1); });
      if (next) next.addEventListener("click", function () { show(index + 1); });
      gallery.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") show(index - 1);
        if (e.key === "ArrowRight") show(index + 1);
      });
    });
  }

  function initAdmin() {
    var body = qs("[data-admin-body]");
    if (!body) return;
    var rows = window.DAULAT_BOOKINGS || [];
    body.innerHTML = rows.map(function (row) {
      return "<tr><td>" + row.id + "</td><td>" + row.name + "</td><td>" + row.car + "</td><td>" + row.when + "</td><td>" + row.total + "</td><td>" + row.status + "</td></tr>";
    }).join("");
  }

  function initConfirmation() {
    var root = qs("[data-confirmation]");
    if (!root) return;
    var raw = null;
    try { raw = sessionStorage.getItem("daulat-confirmation"); } catch (e) {}
    if (!raw) return;
    var data = {};
    try { data = JSON.parse(raw); } catch (e) { return; }
    var map = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      car: data.car_name || data.car,
      location: data.pickup_location,
      when: data.intent === "sale" ? "Sale enquiry" : ((data.pickup || "") + " " + (data.pickup_time || "") + " → " + (data["return"] || "") + " " + (data.return_time || "")),
      total: data.intent === "sale"
        ? (data.sale_price_bdt ? formatSale(data.sale_price_bdt) + " asking" : "Asking price at desk")
        : (data.estimated_total_bdt ? Number(data.estimated_total_bdt).toLocaleString("en-US") + " BDT estimated" : "—")
    };
    Object.keys(map).forEach(function (key) {
      var el = qs('[data-confirm="' + key + '"]');
      if (el && map[key]) el.textContent = map[key];
    });
    var lead = qs("[data-confirm-lead]");
    if (lead) {
      if (data.intent === "sale") lead.textContent = "Your purchase enquiry is ready. We will reply from the Daulatpur desk.";
      else if (data.intent === "contact") lead.textContent = "Your message is ready. The Daulatpur desk will reply by phone or email.";
      else lead.textContent = "Your reservation request is ready. This is not a confirmed booking until the desk calls you.";
    }
  }

  function initPreviewDetail() {
    var panel = qs("#preview-detail");
    if (!panel) return;
    function render(slug) {
      var car = carBySlug(carsCache, slug);
      if (!car) return;
      panel.hidden = false;
      var img = (car.local_images && car.local_images[0]) || (car.images && car.images[0]) || "";
      panel.innerHTML =
        '<p class="crumbs"><a href="#fleet">Fleet</a> / ' + car.make + " " + car.model + "</p>" +
        "<h2>" + car.year + " " + car.make + " " + car.model + "</h2>" +
        '<img src="' + img + '" alt="' + car.year + " " + car.make + " " + car.model + '" style="width:100%;border-radius:16px;background:#f3f4f6">' +
        "<p>" + car.description + "</p>" +
        "<p><strong>" + formatDaily(car.rental_rate_per_day) + "</strong> · Sale " + formatSale(car.sale_price) + "</p>" +
        "<p>" + car.seats + " seats · " + car.transmission + " · " + car.fuel + " · " + Number(car.mileage_km).toLocaleString("en-US") + " km</p>" +
        '<p><button class="btn btn-primary" type="button" data-open-booking data-slug="' + car.slug + '" data-intent="rent">Book this car</button> ' +
        '<button class="btn btn-accent" type="button" data-open-booking data-slug="' + car.slug + '" data-intent="sale">Enquire to Buy</button></p>';
      qsa("[data-open-booking]", panel).forEach(function (btn) {
        btn.addEventListener("click", function () {
          openModal(btn.getAttribute("data-slug"), btn.getAttribute("data-intent"));
        });
      });
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    qsa("[data-preview-detail]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        render(a.getAttribute("data-preview-detail"));
      });
    });
    if (location.hash.indexOf("#car-") === 0) render(location.hash.slice(5));
  }

  document.addEventListener("DOMContentLoaded", function () {
    initChrome();
    initDates(document);
    initGallery();
    initConfirmation();
    loadCars().then(function (cars) {
      carsCache = cars || [];
      initListing();
      initBooking();
      initPreviewDetail();
      initAdmin();
    });
  });

  window.DaulatDrive = {
    formatDaily: formatDaily,
    formatSale: formatSale,
    rentalDays: rentalDays,
    CONFIG: CONFIG
  };
})();
