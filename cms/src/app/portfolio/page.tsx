import Link from "next/link";
import { prisma } from "@/lib/db";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";

export const revalidate = 60;

export default async function PortfolioPage() {
  const items = await prisma.portfolioItem.findMany({ where: { status: "published" }, orderBy: { updatedAt: "desc" } });
  return (
    <>
      <PublicHeader />
      <main className="wrap hero">
        <h1>Portfolio</h1>
        <div className="grid">
          {items.map((item) => (
            <article className="card" key={item.id}>
              {item.image ? <img src={item.image} alt="" /> : null}
              <h2><Link href={`/portfolio/${item.slug}`}>{item.title}</Link></h2>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
