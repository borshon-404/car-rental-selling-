import { NextResponse } from "next/server";
import { assertSameOrigin, readSession } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const site = (await getSetting("site_url")) || process.env.NEXT_PUBLIC_SITE_URL || "";
  if (!site.startsWith("http")) return NextResponse.json({ error: "Set a public site URL first." }, { status: 400 });
  const sitemap = `${site.replace(/\/$/, "")}/sitemap.xml`;
  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
  ];
  const results = [];
  for (const url of targets) {
    try {
      const res = await fetch(url, { method: "GET" });
      results.push({ url, status: res.status });
    } catch (error) {
      results.push({ url, error: error instanceof Error ? error.message : "failed" });
    }
  }
  return NextResponse.json({ ok: true, sitemap, results });
}
