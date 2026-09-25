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
  const [page, settings] = await Promise.all([
    prisma.page.findUnique({ where: { slug } }),
    publicSettings(),
  ]);
  if (!page || page.status !== "published") return { title: "Not found", robots: { index: false, follow: false } };
  return seoMetadata({
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt,
    robots: page.robots,
    canonical: page.canonicalUrl,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    ogImage: page.ogImage,
    siteUrl: settings.siteUrl,
    path: `/p/${page.slug}`,
  });
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug }, include: { sections: { orderBy: { sortOrder: "asc" } } } });
  if (!page || page.status !== "published") notFound();
  return (
    <>
      <PublicHeader />
      <main className="wrap hero prose">
        <h1>{page.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body) }} />
        {page.sections.filter((section) => section.visible).map((section) => (
          <section key={section.id}>
            <h2>{section.label}</h2>
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(section.body) }} />
          </section>
        ))}
      </main>
      <PublicFooter />
    </>
  );
}
