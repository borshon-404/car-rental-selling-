import Link from "next/link";
import { getChrome } from "@/lib/chrome";

export async function PublicHeader() {
  const { header } = await getChrome();
  return (
    <header className="public-header">
      {header.announcement ? <div className="wrap" style={{ paddingTop: 8, fontSize: 14 }}>{header.announcement}</div> : null}
      <div className="wrap bar">
        <Link href="/"><strong>{header.logoText}</strong> <span style={{ opacity: 0.7 }}>{header.tagline}</span></Link>
        <nav className="nav" aria-label="Primary">
          {header.links.map((link) => (
            <Link key={link.href + link.label} href={link.href}>{link.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export async function PublicFooter() {
  const { footer } = await getChrome();
  return (
    <footer className="public-footer">
      <div className="wrap" style={{ padding: "28px 0" }}>
        <p>{footer.blurb}</p>
        <p>{footer.address}<br /><a href={`mailto:${footer.email}`}>{footer.email}</a> · <a href={`tel:${footer.phone}`}>{footer.phone}</a></p>
        <nav className="nav">
          {footer.links.map((link) => (
            <Link key={link.href + link.label} href={link.href}>{link.label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
