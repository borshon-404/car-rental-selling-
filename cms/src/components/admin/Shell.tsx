import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

const links = [
  ["Dashboard", "/admin"],
  ["Fleet", "/admin/cars"],
  ["Requests", "/admin/bookings"],
  ["Public site", "/"],
  ["Pages", "/admin/content/pages"],
  ["Posts", "/admin/content/posts"],
  ["Products", "/admin/content/products"],
  ["Portfolio", "/admin/content/portfolio"],
  ["Header & footer", "/admin/chrome"],
  ["Media", "/admin/media"],
  ["SEO & SMTP", "/admin/settings"],
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword) redirect("/admin/change-password");
  return (
    <div className="shell">
      <aside className="side">
        <p style={{ margin: "0 10px 16px" }}><strong>Daulat CMS</strong><br /><span style={{ opacity: 0.7, fontSize: 13 }}>{user.email}</span></p>
        <nav className="nav-links" aria-label="Admin">
          {links.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <LogoutButton />
      </aside>
      <div className="main">{children}</div>
    </div>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { cookies } = await import("next/headers");
        const { COOKIE } = await import("@/lib/auth");
        (await cookies()).set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
        const { redirect: go } = await import("next/navigation");
        go("/admin/login");
      }}
    >
      <button className="btn secondary" type="submit">Sign out</button>
    </form>
  );
}
