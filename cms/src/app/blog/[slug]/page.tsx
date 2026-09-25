import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { renderMarkdown } from "@/lib/markdown";
import { publicSettings } from "@/lib/settings";
import { JsonLd, seoMetadata } from "@/components/Seo";
import { articleJsonLd } from "@/lib/jsonld";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([prisma.post.findUnique({ where: { slug } }), publicSettings()]);
  if (!post || post.status !== "published") return { robots: { index: false } };
  return seoMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    robots: post.robots,
    canonical: post.canonicalUrl,
    ogTitle: post.ogTitle,
    ogDescription: post.ogDescription,
    ogImage: post.ogImage || post.coverImage,
    siteUrl: settings.siteUrl,
    path: `/blog/${post.slug}`,
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([prisma.post.findUnique({ where: { slug } }), publicSettings()]);
  if (!post || post.status !== "published") notFound();
  const url = `${settings.siteUrl.replace(/\/$/, "")}/blog/${post.slug}`;
  return (
    <>
      <PublicHeader />
      <main className="wrap hero prose">
        <JsonLd data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          url,
          image: post.coverImage,
          datePublished: post.publishedAt?.toISOString(),
          author: post.authorName,
        })} />
        {post.coverImage ? <img src={post.coverImage} alt="" /> : null}
        <h1>{post.title}</h1>
        <p>{post.authorName}{post.publishedAt ? ` · ${post.publishedAt.toISOString().slice(0, 10)}` : ""}</p>
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      </main>
      <PublicFooter />
    </>
  );
}
