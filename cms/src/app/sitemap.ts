import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { publicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await publicSettings();
  const base = settings.siteUrl.replace(/\/$/, "");
  const pages = ["/", "/fleet.html", "/sale.html", "/about.html", "/faq.html", "/contact.html", "/terms.html", "/privacy.html"];
  const cars = await prisma.car.findMany({ where: { published: true } });
  return [
    ...pages.map((path) => ({ url: `${base}${path === "/" ? "/" : path}`, lastModified: new Date() })),
    ...cars.map((car) => ({ url: `${base}/car-detail-${car.slug}.html`, lastModified: car.updatedAt })),
  ];
}
