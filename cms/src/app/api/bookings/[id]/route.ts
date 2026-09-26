import { NextResponse } from "next/server";
import { assertSameOrigin, readSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const STATUSES = new Set(["new", "called", "confirmed", "declined"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try { assertSameOrigin(request); } catch { return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 }); }
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { status?: string } | null;
  const status = String(body?.status || "");
  if (!STATUSES.has(status)) return NextResponse.json({ error: "Unknown status." }, { status: 400 });
  const booking = await prisma.booking.update({ where: { id }, data: { status } });
  return NextResponse.json(booking);
}
