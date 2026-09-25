"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/Nav";

type Media = { id: string; url: string; alt: string; filename: string; mime: string };

export default function MediaPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function load() {
    const res = await fetch("/api/media");
    if (res.status === 401 || res.status === 403) {
      window.location.href = "/admin/login";
      return;
    }
    setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/media", { method: "POST", body: new FormData(event.currentTarget) });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Upload failed.");
      return;
    }
    event.currentTarget.reset();
    load();
  }

  return (
    <div className="shell">
      <AdminNav current="/admin/media" />
      <div className="main">
        <h1>Media library</h1>
        <p>Uploads land in <code>public/uploads</code> unless Cloudinary credentials are set.</p>
        {error ? <p className="error">{error}</p> : null}
        <form className="form" onSubmit={onSubmit}>
          <label>File<input name="file" type="file" accept="image/*" required /></label>
          <label>Alt text<input name="alt" placeholder="Describe the image" /></label>
          <button className="btn" type="submit">Upload</button>
        </form>
        <div className="media-grid" style={{ marginTop: 18 }}>
          {items.map((item) => (
            <figure key={item.id}>
              {item.mime.startsWith("image/") ? <img src={item.url} alt={item.alt || item.filename} /> : null}
              <figcaption>
                <button type="button" className="btn secondary" onClick={() => { navigator.clipboard.writeText(item.url); setCopied(item.url); }}>Copy URL</button>
                <div>{item.alt || item.filename}</div>
              </figcaption>
            </figure>
          ))}
        </div>
        {copied ? <p className="ok">Copied {copied}</p> : null}
      </div>
    </div>
  );
}
