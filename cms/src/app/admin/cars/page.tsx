"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/Nav";

type Car = {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  type: string;
  seats: number;
  transmission: string;
  fuel: string;
  rentalRate: number;
  salePrice: number;
  availability: string;
  focus: string;
  description: string;
  image: string;
  published: boolean;
};

const empty = {
  make: "", model: "", year: 2020, type: "Sedan", seats: 5, transmission: "Automatic", fuel: "Petrol",
  rentalRate: 3500, salePrice: 0, availability: "available", focus: "rental", description: "", image: "", published: true, slug: "",
};

export default function CarsAdmin() {
  const [cars, setCars] = useState<Car[]>([]);
  const [form, setForm] = useState<Record<string, string | number | boolean>>(empty);
  const [editing, setEditing] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/cars");
    if (!res.ok) { window.location.href = "/admin/login"; return; }
    setCars(await res.json());
  }
  useEffect(() => { load(); }, []);

  function set(name: string, value: string | number | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const payload = {
      make: form.make, model: form.model, year: form.year, slug: form.slug, type: form.type,
      seats: form.seats, transmission: form.transmission, fuel: form.fuel,
      rentalRate: form.rentalRate, salePrice: form.salePrice, availability: form.availability,
      focus: form.focus, description: form.description, image: form.image, published: form.published,
    };
    const res = await fetch(editing ? `/api/cars/${editing}` : "/api/cars", {
      method: editing ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error || "Could not save the car."); return; }
    setMessage(editing ? "Car updated. The public fleet reads this immediately." : "Car added to the fleet.");
    setEditing("");
    setForm(empty);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Remove this car from the fleet?")) return;
    const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
    if (!res.ok) setError("Delete failed.");
    else load();
  }

  return (
    <div className="shell">
      <AdminNav current="/admin/cars" />
      <div className="main">
        <h1>Fleet</h1>
        <p>These cars appear on the public rental site. Rates are BDT per day. Sale prices are the full taka amount, for example 1250000 for 12,50,000 BDT.</p>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="ok">{message}</p> : null}
        <form className="form" onSubmit={save}>
          <label>Make<input value={String(form.make)} onChange={(e) => set("make", e.target.value)} required /></label>
          <label>Model<input value={String(form.model)} onChange={(e) => set("model", e.target.value)} required /></label>
          <label>Year<input type="number" value={String(form.year)} onChange={(e) => set("year", Number(e.target.value))} /></label>
          <label>Slug<input value={String(form.slug)} onChange={(e) => set("slug", e.target.value)} placeholder="auto from make-model-year" /></label>
          <label>Type<input value={String(form.type)} onChange={(e) => set("type", e.target.value)} /></label>
          <label>Seats<input type="number" value={String(form.seats)} onChange={(e) => set("seats", Number(e.target.value))} /></label>
          <label>Transmission
            <select value={String(form.transmission)} onChange={(e) => set("transmission", e.target.value)}>
              <option>Automatic</option><option>Manual</option>
            </select>
          </label>
          <label>Fuel<input value={String(form.fuel)} onChange={(e) => set("fuel", e.target.value)} /></label>
          <label>Daily rate (BDT)<input type="number" value={String(form.rentalRate)} onChange={(e) => set("rentalRate", Number(e.target.value))} /></label>
          <label>Sale price (BDT)<input type="number" value={String(form.salePrice)} onChange={(e) => set("salePrice", Number(e.target.value))} /></label>
          <label>Status
            <select value={String(form.availability)} onChange={(e) => set("availability", e.target.value)}>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
            </select>
          </label>
          <label>Focus
            <select value={String(form.focus)} onChange={(e) => set("focus", e.target.value)}>
              <option value="rental">Rental</option>
              <option value="sale">For sale</option>
              <option value="both">Both</option>
            </select>
          </label>
          <label>Image path or URL<input value={String(form.image)} onChange={(e) => set("image", e.target.value)} placeholder="/assets/images/cars/toyota-premio-2019-1.jpg" /></label>
          <label>Description<textarea value={String(form.description)} onChange={(e) => set("description", e.target.value)} /></label>
          <button className="btn" type="submit">{editing ? "Save car" : "Add car"}</button>
          {editing ? <button className="btn secondary" type="button" onClick={() => { setEditing(""); setForm(empty); }}>Cancel</button> : null}
        </form>
        <table>
          <thead><tr><th>Car</th><th>Rate</th><th>Sale</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id}>
                <td>{car.year} {car.make} {car.model}</td>
                <td>{car.rentalRate.toLocaleString("en-US")} BDT/day</td>
                <td>{car.salePrice.toLocaleString("en-US")}</td>
                <td>{car.availability}</td>
                <td>
                  <button className="btn secondary" type="button" onClick={() => { setEditing(car.id); setForm(car); }}>Edit</button>
                  <button className="btn danger" type="button" onClick={() => remove(car.id)}>Delete</button>
                  <a href={`/car-detail-${car.slug}.html`}>View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
