import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { renderMarkdown } from "@/lib/markdown";
import { publicSettings } from "@/lib/settings";
import { seoMetadata } from "@/components/Seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [item, settings] = await Promise.all([prisma.portfolioItem.findUnique({ where: { slug } }), publicSettings()]);
  if (!item || item.status !== "published") return { robots: { index: false } };
  return seoMetadata({
    title: item.seoTitle || item.title,
    description: item.seoDescription || item.summary,
    robots: item.robots,
    canonical: item.canonicalUrl,
    ogTitle: item.ogTitle,
    ogDescription: item.ogDescription,
    ogImage: item.ogImage || item.image,
    siteUrl: settings.siteUrl,
    path: `/portfolio/${item.slug}`,
  });
}

export default async function PortfolioItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await prisma.portfolioItem.findUnique({ where: { slug } });
  if (!item || item.status !== "published") notFound();
  return (
    <>
      <PublicHeader />
      <main className="wrap hero prose">
        {item.image ? <img src={item.image} alt={item.title} /> : null}
        <h1>{item.title}</h1>
        <p>{[item.client, item.year, item.tags].filter(Boolean).join(" · ")}</p>
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body || item.summary) }} />
      </main>
      <PublicFooter />
    </>
  );
}
