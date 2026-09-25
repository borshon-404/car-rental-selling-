import { NextResponse } from "next/server";
import { assertSameOrigin, readSession } from "@/lib/auth";
import { bustContent, createContent, isType, listContent, snapshot } from "@/lib/content";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ type: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type } = await context.params;
  if (!isType(type)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
  return NextResponse.json(await listContent(type));
}

export async function POST(request: Request, context: { params: Promise<{ type: string }> }) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type } = await context.params;
  if (!isType(type)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "JSON body required." }, { status: 400 });
  try {
    const created = await createContent(type, body);
    if (type === "pages" && Array.isArray(body.sections)) {
      const sections = body.sections as Array<Record<string, unknown>>;
      if (sections.length) {
        await prisma.section.createMany({
          data: sections.map((section, index) => ({
            pageId: created.id,
            key: String(section.key || `section-${index + 1}`),
            label: String(section.label || `Section ${index + 1}`),
            body: String(section.body || ""),
            sortOrder: Number(section.sortOrder ?? index),
            visible: section.visible !== false,
          })),
        });
      }
    }
    await snapshot(type, created.id, created, session);
    bustContent(type, created.slug);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create.";
    return NextResponse.json({ error: message.includes("Unique") ? "That slug is already used." : "Could not create." }, { status: 400 });
  }
}
