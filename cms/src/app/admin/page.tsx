import Link from "next/link";
import { AdminShell } from "@/components/admin/Shell";
import { prisma } from "@/lib/db";

export default async function Dashboard() {
  const [pages, posts, products, work, media] = await Promise.all([
    prisma.page.count(),
    prisma.post.count(),
    prisma.product.count(),
    prisma.portfolioItem.count(),
    prisma.media.count(),
  ]);
  const cards = [
    ["Pages", pages, "/admin/content/pages"],
    ["Posts", posts, "/admin/content/posts"],
    ["Products", products, "/admin/content/products"],
    ["Portfolio", work, "/admin/content/portfolio"],
    ["Media", media, "/admin/media"],
  ];
  return (
    <AdminShell>
      <h1>Dashboard</h1>
      <p>Edit content here. Published items appear on the public site. Drafts stay hidden.</p>
      <div className="grid">
        {cards.map(([label, count, href]) => (
          <Link key={String(href)} href={String(href)} className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <h2>{count}</h2>
            <p>{label}</p>
          </Link>
        ))}
      </div>
      <p><a href="/" target="_blank" rel="noreferrer">Open the public site</a></p>
    </AdminShell>
  );
}
