import { NextResponse } from "next/server";
import { assertSameOrigin, readSession } from "@/lib/auth";
import { bustContent, deleteContent, getContent, isType, snapshot, updateContent } from "@/lib/content";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ type: string; id: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type, id } = await context.params;
  if (!isType(type)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
  const row = await getContent(type, id);
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const revisions = await prisma.revision.findMany({
    where: { entityType: type, entityId: id },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return NextResponse.json({ item: row, revisions });
}

export async function PATCH(request: Request, context: { params: Promise<{ type: string; id: string }> }) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type, id } = await context.params;
  if (!isType(type)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "JSON body required." }, { status: 400 });
  const before = await getContent(type, id);
  if (!before) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await snapshot(type, id, before, session);
  try {
    const updated = await updateContent(type, id, body);
    if (type === "pages" && Array.isArray(body.sections)) {
      await prisma.section.deleteMany({ where: { pageId: id } });
      const sections = body.sections as Array<Record<string, unknown>>;
      if (sections.length) {
        await prisma.section.createMany({
          data: sections.map((section, index) => ({
            pageId: id,
            key: String(section.key || `section-${index + 1}`),
            label: String(section.label || `Section ${index + 1}`),
            body: String(section.body || ""),
            sortOrder: Number(section.sortOrder ?? index),
            visible: section.visible !== false,
          })),
        });
      }
    }
    bustContent(type, (updated as { slug?: string } | null)?.slug);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Could not save. The slug may already be used." }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ type: string; id: string }> }) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Only an admin can delete." }, { status: 403 });
  const { type, id } = await context.params;
  if (!isType(type)) return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
  const before = await getContent(type, id);
  if (!before) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await snapshot(type, id, before, session);
  await deleteContent(type, id);
  bustContent(type, (before as { slug?: string }).slug);
  return NextResponse.json({ ok: true });
}
