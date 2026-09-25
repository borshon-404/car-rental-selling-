import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { assertSameOrigin, readSession } from "@/lib/auth";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX = 5 * 1024 * 1024;

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const alt = String(form.get("alt") || "");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file." }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Use JPG, PNG, WEBP, or GIF. SVG is blocked so a file cannot run script." }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "File must be 5 MB or smaller." }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-|-$/g, "");
  const filename = `${Date.now()}-${safeName || "upload"}`;

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudKey = process.env.CLOUDINARY_API_KEY;
  const cloudSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloud && cloudKey && cloudSecret) {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "daulat-cms";
    const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${cloudSecret}`).digest("hex");
    const signed = new FormData();
    signed.set("file", new Blob([bytes], { type: file.type }), filename);
    signed.set("folder", folder);
    signed.set("timestamp", String(timestamp));
    signed.set("api_key", cloudKey);
    signed.set("signature", signature);
    const upload = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: signed });
    if (!upload.ok) {
      const detail = await upload.text();
      return NextResponse.json({ error: `Cloudinary rejected the upload. ${detail.slice(0, 180)}` }, { status: 502 });
    }
    const json = (await upload.json()) as { secure_url?: string; width?: number; height?: number };
    if (!json.secure_url) return NextResponse.json({ error: "Cloudinary did not return a URL." }, { status: 502 });
    const media = await prisma.media.create({
      data: { filename, url: json.secure_url, alt, mime: file.type, size: file.size, width: json.width, height: json.height },
    });
    return NextResponse.json(media, { status: 201 });
  }

  if (process.env.VERCEL) {
    return NextResponse.json({
      error: "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET. Vercel cannot keep uploaded files on disk.",
    }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  const media = await prisma.media.create({
    data: { filename, url: `/uploads/${filename}`, alt, mime: file.type, size: file.size },
  });
  return NextResponse.json(media, { status: 201 });
}
