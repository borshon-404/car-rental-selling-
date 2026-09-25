import type { MetadataRoute } from "next";
import { publicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await publicSettings();
  const base = settings.siteUrl.replace(/\/$/, "");
  const extra = settings.robotsExtra
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("Disallow:") || line.startsWith("Allow:"));
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", ...extra.filter((line) => line.startsWith("Disallow:")).map((line) => line.replace("Disallow:", "").trim())],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
