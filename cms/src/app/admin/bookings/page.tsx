"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/Nav";

type Booking = {
  id: string;
  createdAt: string;
  intent: string;
  name: string;
  email: string;
  phone: string;
  carName: string;
  pickupLocation: string;
  pickupDate: string;
  returnDate: string;
  days: number;
  driver: boolean;
  estimatedTotal: number;
  message: string;
  status: string;
};

export default function BookingsAdmin() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/bookings");
    if (!res.ok) { window.location.href = "/admin/login"; return; }
    setRows(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    setError("");
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setError("Could not update that request.");
    else load();
  }

  return (
    <div className="shell">
      <AdminNav current="/admin/bookings" />
      <div className="main">
        <h1>Reservation requests</h1>
        <p>A request is not a confirmed hire until you call the customer. Phone +8801330132141 is the desk line shown on the site.</p>
        {error ? <p className="error">{error}</p> : null}
        <table>
          <thead><tr><th>When</th><th>Customer</th><th>Car</th><th>Dates</th><th>Estimate</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.createdAt.slice(0, 16).replace("T", " ")}</td>
                <td>{row.name}<br />{row.phone}<br />{row.email}</td>
                <td>{row.intent} · {row.carName || "—"}<br />{row.pickupLocation}{row.driver ? " · driver" : ""}{row.message ? <><br />{row.message}</> : null}</td>
                <td>{row.pickupDate || "—"} → {row.returnDate || "—"}<br />{row.days ? `${row.days} day(s)` : ""}</td>
                <td>{row.estimatedTotal ? `${row.estimatedTotal.toLocaleString("en-US")} BDT` : "—"}</td>
                <td>
                  <select value={row.status} onChange={(e) => setStatus(row.id, e.target.value)}>
                    <option value="new">New</option>
                    <option value="called">Called</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="declined">Declined</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p>No requests yet. They appear here when someone uses Book a Car on the public site.</p> : null}
      </div>
    </div>
  );
}
