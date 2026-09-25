import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { renderMarkdown } from "@/lib/markdown";
import { publicSettings } from "@/lib/settings";
import { JsonLd, seoMetadata } from "@/components/Seo";
import { localBusinessJsonLd } from "@/lib/jsonld";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "home" } }),
    publicSettings(),
  ]);
  if (!page) return { title: settings.siteName };
  return seoMetadata({
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt,
    robots: page.robots,
    canonical: page.canonicalUrl,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImage: page.ogImage,
    siteUrl: settings.siteUrl,
    path: "/",
  });
}

export default async function HomePage() {
  const [settings, page, posts, products, work] = await Promise.all([
    publicSettings(),
    prisma.page.findUnique({ where: { slug: "home" }, include: { sections: { orderBy: { sortOrder: "asc" } } } }),
    prisma.post.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" }, take: 3 }),
    prisma.product.findMany({ where: { status: "published" }, take: 3 }),
    prisma.portfolioItem.findMany({ where: { status: "published" }, take: 3 }),
  ]);
  return (
    <>
      <PublicHeader />
      <main className="wrap hero">
        <JsonLd data={localBusinessJsonLd(settings.siteUrl)} />
        <p style={{ letterSpacing: ".12em", textTransform: "uppercase", color: "var(--orange)", fontWeight: 700 }}>Daulatpur, Khulna</p>
        <h1>{page?.title || settings.siteName}</h1>
        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(page?.body || "Publish a page with slug `home` to replace this text.") }} />
        {page?.sections.filter((section) => section.visible).map((section) => (
          <section key={section.id} style={{ marginTop: 28 }}>
            <h2>{section.label}</h2>
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(section.body) }} />
          </section>
        ))}
        <h2>Latest posts</h2>
        <div className="grid">
          {posts.map((post) => (
            <article className="card" key={post.id}>
              <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
              <p>{post.excerpt}</p>
            </article>
          ))}
        </div>
        <h2>Products</h2>
        <div className="grid">
          {products.map((product) => (
            <article className="card" key={product.id}>
              <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
              <p>{(product.priceCents / 100).toLocaleString("en-BD")} {product.currency}</p>
            </article>
          ))}
        </div>
        <h2>Portfolio</h2>
        <div className="grid">
          {work.map((item) => (
            <article className="card" key={item.id}>
              <h3><Link href={`/portfolio/${item.slug}`}>{item.title}</Link></h3>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
