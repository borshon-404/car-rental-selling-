import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { publicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await publicSettings();
  const base = settings.siteUrl.replace(/\/$/, "");
  const [pages, posts, products, work] = await Promise.all([
    prisma.page.findMany({ where: { status: "published", robots: { not: { contains: "noindex" } } } }),
    prisma.post.findMany({ where: { status: "published", robots: { not: { contains: "noindex" } } } }),
    prisma.product.findMany({ where: { status: "published", robots: { not: { contains: "noindex" } } } }),
    prisma.portfolioItem.findMany({ where: { status: "published", robots: { not: { contains: "noindex" } } } }),
  ]);
  const staticRoutes = ["", "/blog", "/products", "/portfolio"].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
  }));
  return [
    ...staticRoutes,
    ...pages.filter((page) => page.slug !== "home").map((page) => ({ url: `${base}/p/${page.slug}`, lastModified: page.updatedAt })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.updatedAt })),
    ...products.map((product) => ({ url: `${base}/products/${product.slug}`, lastModified: product.updatedAt })),
    ...work.map((item) => ({ url: `${base}/portfolio/${item.slug}`, lastModified: item.updatedAt })),
  ];
}
