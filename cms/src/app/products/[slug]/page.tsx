import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";
import { renderMarkdown } from "@/lib/markdown";
import { publicSettings } from "@/lib/settings";
import { JsonLd, seoMetadata } from "@/components/Seo";
import { productJsonLd } from "@/lib/jsonld";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([prisma.product.findUnique({ where: { slug } }), publicSettings()]);
  if (!product || product.status !== "published") return { robots: { index: false } };
  return seoMetadata({
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description.slice(0, 160),
    robots: product.robots,
    canonical: product.canonicalUrl,
    ogTitle: product.ogTitle,
    ogDescription: product.ogDescription,
    ogImage: product.ogImage || product.image,
    siteUrl: settings.siteUrl,
    path: `/products/${product.slug}`,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([prisma.product.findUnique({ where: { slug } }), publicSettings()]);
  if (!product || product.status !== "published") notFound();
  const price = (product.priceCents / 100).toFixed(2);
  const url = `${settings.siteUrl.replace(/\/$/, "")}/products/${product.slug}`;
  return (
    <>
      <PublicHeader />
      <main className="wrap hero">
        <JsonLd data={productJsonLd({
          name: product.name,
          description: product.description,
          url,
          image: product.image,
          price,
          currency: product.currency,
          sku: product.sku,
        })} />
        {product.image ? <img src={product.image} alt={product.name} style={{ maxHeight: 420, objectFit: "contain" }} /> : null}
        <h1>{product.name}</h1>
        <p><strong>{Number(price).toLocaleString("en-BD")} {product.currency}</strong>{product.sku ? ` · SKU ${product.sku}` : ""}</p>
        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(product.description) }} />
      </main>
      <PublicFooter />
    </>
  );
}
