"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/Nav";

type Settings = Record<string, string | boolean | number>;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings").then(async (res) => {
      if (!res.ok) window.location.href = "/admin/login";
      else setSettings(await res.json());
    });
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) setError(json.error || "Save failed.");
    else {
      setSettings(json.settings);
      setMessage("Settings saved.");
    }
  }

  async function testEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const res = await fetch("/api/settings/test-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) setError(json.error || "Test failed.");
    else setMessage(`Test sent. Message id ${json.messageId}`);
  }

  async function ping() {
    const res = await fetch("/api/sitemap-ping", { method: "POST" });
    const json = await res.json();
    setMessage(res.ok ? `Pinged sitemap ${json.sitemap}` : json.error);
  }

  if (!settings) return <p className="wrap">Loading settings…</p>;
  return (
    <div className="shell">
      <AdminNav current="/admin/settings" />
      <div className="main">
        <h1>SEO, analytics, SMTP</h1>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="ok">{message}</p> : null}
        <form className="form" onSubmit={save}>
          <h2>Site</h2>
          <label>Site name<input name="site_name" defaultValue={String(settings.siteName || "")} /></label>
          <label>Public site URL<input name="site_url" defaultValue={String(settings.siteUrl || "")} /></label>
          <label>ISR seconds<input name="revalidate_seconds" type="number" min="0" defaultValue={String(settings.revalidateSeconds || 60)} /></label>
          <h2>Google Analytics</h2>
          <label>Measurement ID<input name="ga_measurement_id" placeholder="G-XXXXXXXX" defaultValue={String(settings.gaId || "")} /></label>
          <label>Enabled
            <select name="ga_enabled" defaultValue={settings.gaEnabled === false ? "false" : "true"}>
              <option value="true">On</option>
              <option value="false">Off</option>
            </select>
          </label>
          <h2>Search Console</h2>
          <label>Verification token<input name="gsc_verification_token" defaultValue={String(settings.gscToken || "")} /></label>
          <label>Method
            <select name="gsc_method" defaultValue={String(settings.gscMethod || "meta")}>
              <option value="meta">Meta tag</option>
              <option value="file">HTML file</option>
            </select>
          </label>
          <p>Meta method injects <code>google-site-verification</code>. File method is served at <code>/googleTOKEN.html</code>.</p>
          <h2>robots.txt extra lines</h2>
          <label>One directive per line<textarea name="robots_extra" defaultValue={String(settings.robotsExtra || "")} placeholder="Disallow: /draft" style={{ minHeight: 80 }} /></label>
          <h2>SMTP</h2>
          <label>Host<input name="smtp_host" defaultValue={String(settings.smtpHost || "")} /></label>
          <label>Port<input name="smtp_port" defaultValue={String(settings.smtpPort || "587")} /></label>
          <label>Secure
            <select name="smtp_secure" defaultValue={settings.smtpSecure ? "true" : "false"}>
              <option value="false">STARTTLS (587)</option>
              <option value="true">SSL (465)</option>
            </select>
          </label>
          <label>Username<input name="smtp_user" defaultValue={String(settings.smtpUser || "")} /></label>
          <label>Password<input name="smtp_password" type="password" placeholder={settings.smtpPasswordSet ? "Stored — leave blank to keep" : "SMTP password"} /></label>
          <label>From<input name="smtp_from" defaultValue={String(settings.smtpFrom || "")} /></label>
          <button className="btn" type="submit">Save settings</button>
        </form>
        <form className="form" onSubmit={testEmail} style={{ marginTop: 24 }}>
          <h2>Send a test email</h2>
          <label>To<input name="to" type="email" required placeholder="mail@gmail.com" /></label>
          <button className="btn orange" type="submit">Send test</button>
        </form>
        <p><button className="btn secondary" type="button" onClick={ping}>Ping sitemap to Google and Bing</button></p>
      </div>
    </div>
  );
}
