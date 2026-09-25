"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/Nav";

export default function ChromePage() {
  const [header, setHeader] = useState("{\n  \"logoText\": \"Daulat Drive\"\n}");
  const [footer, setFooter] = useState("{}");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/chrome").then(async (res) => {
      if (!res.ok) window.location.href = "/admin/login";
      else {
        const json = await res.json();
        setHeader(JSON.stringify(json.header, null, 2));
        setFooter(JSON.stringify(json.footer, null, 2));
      }
    });
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/chrome", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ header: JSON.parse(header), footer: JSON.parse(footer) }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error || "Save failed.");
      else setMessage("Header and footer saved.");
    } catch {
      setError("Both fields must be valid JSON.");
    }
  }

  return (
    <div className="shell">
      <AdminNav current="/admin/chrome" />
      <div className="main">
        <h1>Header and footer</h1>
        <p>JSON. Links are <code>{`{"label":"Home","href":"/"}`}</code>.</p>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="ok">{message}</p> : null}
        <form className="form" onSubmit={save}>
          <label>Header JSON<textarea value={header} onChange={(e) => setHeader(e.target.value)} style={{ minHeight: 220 }} /></label>
          <label>Footer JSON<textarea value={footer} onChange={(e) => setFooter(e.target.value)} style={{ minHeight: 220 }} /></label>
          <button className="btn" type="submit">Save</button>
        </form>
      </div>
    </div>
  );
}
