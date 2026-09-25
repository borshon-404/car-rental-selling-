"use client";

import { useState } from "react";

type Section = { key: string; label: string; body: string; visible: boolean };

export function ContentForm({
  type,
  initial,
}: {
  type: "pages" | "posts" | "products" | "portfolio";
  initial?: Record<string, unknown> & { id?: string; sections?: Section[] };
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sections, setSections] = useState<Section[]>(initial?.sections || []);
  const id = initial?.id;
  const nameField = type === "products" ? "name" : "title";
  const bodyField = type === "products" ? "description" : "body";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const payload: Record<string, unknown> = { ...data, sections: type === "pages" ? sections : undefined };
    if (type === "products") payload.priceCents = Math.round(Number(data.priceTaka || 0) * 100);
    const res = await fetch(id ? `/api/content/${type}/${id}` : `/api/content/${type}`, {
      method: id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Save failed.");
      return;
    }
    setMessage("Saved. Published items update the public site within the revalidate window.");
    if (!id && json.id) window.location.href = `/admin/content/${type}/${json.id}`;
  }

  async function onDelete() {
    if (!id || !confirm("Delete this item?")) return;
    const res = await fetch(`/api/content/${type}/${id}`, { method: "DELETE" });
    if (res.ok) window.location.href = `/admin/content/${type}`;
    else setError("Delete failed. Editors cannot delete.");
  }

  const title = String(initial?.[nameField] || initial?.title || "");
  return (
    <form className="form" onSubmit={onSubmit}>
      {error ? <p className="error">{error}</p> : null}
      {message ? <p className="ok">{message}</p> : null}
      <label>{type === "products" ? "Name" : "Title"}
        <input name={nameField} defaultValue={title} required />
      </label>
      <label>Slug
        <input name="slug" defaultValue={String(initial?.slug || "")} placeholder="auto-from-title" />
      </label>
      <label>Status
        <select name="status" defaultValue={String(initial?.status || "draft")}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>
      {type !== "products" && type !== "portfolio" ? (
        <label>Excerpt
          <textarea name="excerpt" defaultValue={String(initial?.excerpt || "")} style={{ minHeight: 80 }} />
        </label>
      ) : null}
      {type === "portfolio" ? (
        <>
          <label>Summary<textarea name="summary" defaultValue={String(initial?.summary || "")} style={{ minHeight: 80 }} /></label>
          <label>Client<input name="client" defaultValue={String(initial?.client || "")} /></label>
          <label>Year<input name="year" defaultValue={String(initial?.year || "")} /></label>
          <label>Tags<input name="tags" defaultValue={String(initial?.tags || "")} placeholder="rental, khulna" /></label>
        </>
      ) : null}
      {type === "posts" ? (
        <>
          <label>Author<input name="authorName" defaultValue={String(initial?.authorName || "")} /></label>
          <label>Cover image URL<input name="coverImage" defaultValue={String(initial?.coverImage || "")} /></label>
        </>
      ) : null}
      {type === "products" ? (
        <>
          <label>Price in BDT
            <input name="priceTaka" type="number" min="0" step="1" defaultValue={String(Number(initial?.priceCents || 0) / 100)} />
          </label>
          <label>Currency<input name="currency" defaultValue={String(initial?.currency || "BDT")} /></label>
          <label>SKU<input name="sku" defaultValue={String(initial?.sku || "")} /></label>
          <label>Image URL<input name="image" defaultValue={String(initial?.image || "")} /></label>
        </>
      ) : null}
      {type === "portfolio" ? <label>Image URL<input name="image" defaultValue={String(initial?.image || "")} /></label> : null}
      <label>Body (Markdown)
        <textarea name={bodyField} defaultValue={String(initial?.[bodyField] || initial?.body || "")} />
      </label>
      {type === "pages" ? (
        <fieldset className="seo">
          <legend>Page sections</legend>
          {sections.map((section, index) => (
            <div key={index} className="card">
              <label>Label<input value={section.label} onChange={(e) => setSections(sections.map((row, i) => i === index ? { ...row, label: e.target.value } : row))} /></label>
              <label>Key<input value={section.key} onChange={(e) => setSections(sections.map((row, i) => i === index ? { ...row, key: e.target.value } : row))} /></label>
              <label>Body<textarea value={section.body} onChange={(e) => setSections(sections.map((row, i) => i === index ? { ...row, body: e.target.value } : row))} /></label>
              <label style={{ textTransform: "none" }}><input type="checkbox" checked={section.visible} onChange={(e) => setSections(sections.map((row, i) => i === index ? { ...row, visible: e.target.checked } : row))} /> Visible</label>
              <button type="button" className="btn secondary" onClick={() => setSections(sections.filter((_, i) => i !== index))}>Remove section</button>
            </div>
          ))}
          <button type="button" className="btn secondary" onClick={() => setSections([...sections, { key: `section-${sections.length + 1}`, label: "New section", body: "", visible: true }])}>Add section</button>
        </fieldset>
      ) : null}
      <fieldset className="seo">
        <legend>SEO</legend>
        <label>Meta title<input name="seoTitle" defaultValue={String(initial?.seoTitle || "")} maxLength={70} /></label>
        <label>Meta description<textarea name="seoDescription" defaultValue={String(initial?.seoDescription || "")} maxLength={320} style={{ minHeight: 80 }} /></label>
        <label>Robots
          <select name="robots" defaultValue={String(initial?.robots || "index,follow")}>
            <option value="index,follow">index, follow</option>
            <option value="noindex,follow">noindex, follow</option>
            <option value="noindex,nofollow">noindex, nofollow</option>
          </select>
        </label>
        <label>Canonical URL<input name="canonicalUrl" defaultValue={String(initial?.canonicalUrl || "")} placeholder="https://example.com/path" /></label>
        <label>Open Graph title<input name="ogTitle" defaultValue={String(initial?.ogTitle || "")} /></label>
        <label>Open Graph description<input name="ogDescription" defaultValue={String(initial?.ogDescription || "")} /></label>
        <label>Open Graph image<input name="ogImage" defaultValue={String(initial?.ogImage || "")} /></label>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          Preview: <strong>{String(initial?.seoTitle || title || "Meta title")}</strong><br />
          {String(initial?.seoDescription || "Meta description appears here, about 150–160 characters.")}
        </p>
      </fieldset>
      <div className="row">
        <button className="btn" type="submit">{id ? "Save" : "Create"}</button>
        {id ? <button className="btn danger" type="button" onClick={onDelete}>Delete</button> : null}
        {initial?.slug && initial?.status === "published" ? (
          <a className="btn secondary" href={publicHref(type, String(initial.slug))} target="_blank" rel="noreferrer">View</a>
        ) : null}
      </div>
    </form>
  );
}

function publicHref(type: string, slug: string) {
  if (type === "pages") return slug === "home" ? "/" : `/p/${slug}`;
  if (type === "posts") return `/blog/${slug}`;
  if (type === "products") return `/products/${slug}`;
  return `/portfolio/${slug}`;
}
