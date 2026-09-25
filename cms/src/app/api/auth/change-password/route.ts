import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  assertSameOrigin,
  hashPassword,
  readSession,
  sessionCookie,
  signSession,
  userToSession,
  verifyPassword,
} from "@/lib/auth";

const schema = z.object({
  currentPassword: z.string().min(8),
  nextPassword: z.string().min(12).max(200),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "New password must be at least 12 characters." }, { status: 400 });
  }
  if (parsed.data.currentPassword === parsed.data.nextPassword) {
    return NextResponse.json({ error: "Choose a password that is different from the temporary one." }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Current password is wrong." }, { status: 401 });
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.nextPassword), mustChangePassword: false },
  });
  const token = await signSession(await userToSession(updated));
  const cookie = sessionCookie(token);
  const response = NextResponse.json({ ok: true, redirect: "/admin" });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
