import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import type { SessionUser } from "./auth";

export const TYPES = ["pages", "posts", "products", "portfolio"] as const;
export type ContentType = (typeof TYPES)[number];

export function isType(value: string): value is ContentType {
  return (TYPES as readonly string[]).includes(value);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const seo = {
  seoTitle: "",
  seoDescription: "",
  robots: "index,follow",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
};

export function seoFrom(body: Record<string, unknown>) {
  return {
    seoTitle: String(body.seoTitle ?? ""),
    seoDescription: String(body.seoDescription ?? "").slice(0, 320),
    robots: String(body.robots ?? "index,follow"),
    canonicalUrl: String(body.canonicalUrl ?? ""),
    ogTitle: String(body.ogTitle ?? ""),
    ogDescription: String(body.ogDescription ?? ""),
    ogImage: String(body.ogImage ?? ""),
  };
}

export async function listContent(type: ContentType) {
  if (type === "pages") return prisma.page.findMany({ orderBy: { updatedAt: "desc" }, include: { sections: true } });
  if (type === "posts") return prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  if (type === "products") return prisma.product.findMany({ orderBy: { updatedAt: "desc" } });
  return prisma.portfolioItem.findMany({ orderBy: { updatedAt: "desc" } });
}

export async function getContent(type: ContentType, id: string) {
  if (type === "pages") return prisma.page.findUnique({ where: { id }, include: { sections: { orderBy: { sortOrder: "asc" } } } });
  if (type === "posts") return prisma.post.findUnique({ where: { id } });
  if (type === "products") return prisma.product.findUnique({ where: { id } });
  return prisma.portfolioItem.findUnique({ where: { id } });
}

export async function createContent(type: ContentType, body: Record<string, unknown>) {
  const status = body.status === "published" ? "published" : "draft";
  const publishedAt = status === "published" ? new Date() : null;
  const shared = { status, ...seoFrom(body) };
  const dated = { ...shared, publishedAt };
  if (type === "pages") {
    const title = String(body.title || "Untitled page");
    return prisma.page.create({
      data: {
        title,
        slug: slugify(String(body.slug || title)) || `page-${Date.now()}`,
        excerpt: String(body.excerpt || ""),
        body: String(body.body || ""),
        ...dated,
      },
    });
  }
  if (type === "posts") {
    const title = String(body.title || "Untitled post");
    return prisma.post.create({
      data: {
        title,
        slug: slugify(String(body.slug || title)) || `post-${Date.now()}`,
        excerpt: String(body.excerpt || ""),
        body: String(body.body || ""),
        coverImage: String(body.coverImage || ""),
        authorName: String(body.authorName || ""),
        ...dated,
      },
    });
  }
  if (type === "products") {
    const name = String(body.name || body.title || "Untitled product");
    return prisma.product.create({
      data: {
        name,
        slug: slugify(String(body.slug || name)) || `product-${Date.now()}`,
        description: String(body.description || body.body || ""),
        priceCents: Number(body.priceCents || 0),
        currency: String(body.currency || "BDT"),
        sku: String(body.sku || ""),
        image: String(body.image || ""),
        ...shared,
      },
    });
  }
  const title = String(body.title || "Untitled item");
  return prisma.portfolioItem.create({
    data: {
      title,
      slug: slugify(String(body.slug || title)) || `work-${Date.now()}`,
      summary: String(body.summary || body.excerpt || ""),
      body: String(body.body || ""),
      image: String(body.image || ""),
      client: String(body.client || ""),
      year: String(body.year || ""),
      tags: String(body.tags || ""),
      ...shared,
    },
  });
}

export async function updateContent(type: ContentType, id: string, body: Record<string, unknown>) {
  const current = await getContent(type, id);
  if (!current) return null;
  const status = body.status === "published" || body.status === "draft" ? String(body.status) : current.status;
  const seo = seoFrom({ ...(current as object), ...body });
  const patch = { status, ...seo };
  if (type === "pages") {
    const row = current as { title: string; slug: string; publishedAt: Date | null };
    return prisma.page.update({
      where: { id },
      data: {
        title: String(body.title ?? row.title),
        slug: slugify(String(body.slug ?? row.slug)) || row.slug,
        excerpt: String(body.excerpt ?? ""),
        body: String(body.body ?? ""),
        publishedAt: status === "published" ? row.publishedAt ?? new Date() : null,
        ...patch,
      },
    });
  }
  if (type === "posts") {
    const row = current as { title: string; slug: string; publishedAt: Date | null };
    return prisma.post.update({
      where: { id },
      data: {
        title: String(body.title ?? row.title),
        slug: slugify(String(body.slug ?? row.slug)) || row.slug,
        excerpt: String(body.excerpt ?? ""),
        body: String(body.body ?? ""),
        coverImage: String(body.coverImage ?? ""),
        authorName: String(body.authorName ?? ""),
        publishedAt: status === "published" ? row.publishedAt ?? new Date() : null,
        ...patch,
      },
    });
  }
  if (type === "products") {
    const row = current as { name: string; slug: string };
    return prisma.product.update({
      where: { id },
      data: {
        name: String(body.name ?? body.title ?? row.name),
        slug: slugify(String(body.slug ?? row.slug)) || row.slug,
        description: String(body.description ?? body.body ?? ""),
        priceCents: Number(body.priceCents ?? 0),
        currency: String(body.currency ?? "BDT"),
        sku: String(body.sku ?? ""),
        image: String(body.image ?? ""),
        ...patch,
      },
    });
  }
  const row = current as { title: string; slug: string };
  return prisma.portfolioItem.update({
    where: { id },
    data: {
      title: String(body.title ?? row.title),
      slug: slugify(String(body.slug ?? row.slug)) || row.slug,
      summary: String(body.summary ?? body.excerpt ?? ""),
      body: String(body.body ?? ""),
      image: String(body.image ?? ""),
      client: String(body.client ?? ""),
      year: String(body.year ?? ""),
      tags: String(body.tags ?? ""),
      ...patch,
    },
  });
}

export async function deleteContent(type: ContentType, id: string) {
  if (type === "pages") return prisma.page.delete({ where: { id } });
  if (type === "posts") return prisma.post.delete({ where: { id } });
  if (type === "products") return prisma.product.delete({ where: { id } });
  return prisma.portfolioItem.delete({ where: { id } });
}

export async function snapshot(type: string, id: string, data: unknown, actor?: SessionUser | null) {
  await prisma.revision.create({
    data: {
      entityType: type,
      entityId: id,
      snapshot: JSON.stringify(data).slice(0, 20000),
      actorEmail: actor?.email || "",
    },
  });
}

export function bustContent(type: string, slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/products");
  revalidatePath("/portfolio");
  if (!slug) return;
  if (type === "pages") revalidatePath(slug === "home" ? "/" : `/p/${slug}`);
  if (type === "posts") revalidatePath(`/blog/${slug}`);
  if (type === "products") revalidatePath(`/products/${slug}`);
  if (type === "portfolio") revalidatePath(`/portfolio/${slug}`);
}

export function titleOf(row: { title?: string; name?: string }) {
  return row.title || row.name || "Untitled";
}

void seo;
