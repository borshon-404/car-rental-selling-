"use client";

const links = [
  ["Dashboard", "/admin"],
  ["Fleet", "/admin/cars"],
  ["Requests", "/admin/bookings"],
  ["Pages", "/admin/content/pages"],
  ["Posts", "/admin/content/posts"],
  ["Products", "/admin/content/products"],
  ["Portfolio", "/admin/content/portfolio"],
  ["Header & footer", "/admin/chrome"],
  ["Media", "/admin/media"],
  ["SEO & SMTP", "/admin/settings"],
];

export function AdminNav({ current }: { current: string }) {
  return (
    <aside className="side">
      <p style={{ margin: "0 10px 16px" }}><strong>Daulat CMS</strong></p>
      <nav className="nav-links" aria-label="Admin">
        {links.map(([label, href]) => (
          <a key={href} href={href} aria-current={current === href ? "page" : undefined}>{label}</a>
        ))}
      </nav>
    </aside>
  );
}
