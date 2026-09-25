import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { assertSameOrigin, readSession } from "@/lib/auth";

const id = "singleton";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const row = await prisma.siteChrome.upsert({
    where: { id },
    update: {},
    create: { id, headerJson: "{}", footerJson: "{}" },
  });
  return NextResponse.json({
    header: JSON.parse(row.headerJson || "{}"),
    footer: JSON.parse(row.footerJson || "{}"),
  });
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { header?: unknown; footer?: unknown } | null;
  if (!body) return NextResponse.json({ error: "JSON body required." }, { status: 400 });
  const row = await prisma.siteChrome.upsert({
    where: { id },
    update: {
      ...(body.header ? { headerJson: JSON.stringify(body.header) } : {}),
      ...(body.footer ? { footerJson: JSON.stringify(body.footer) } : {}),
    },
    create: {
      id,
      headerJson: JSON.stringify(body.header || {}),
      footerJson: JSON.stringify(body.footer || {}),
    },
  });
  revalidatePath("/");
  return NextResponse.json({ ok: true, header: JSON.parse(row.headerJson), footer: JSON.parse(row.footerJson) });
}
