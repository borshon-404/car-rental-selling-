import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit, sessionCookie, signSession, userToSession, verifyPassword, assertSameOrigin } from "@/lib/auth";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(`login:${ip}`);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Email or password is wrong." }, { status: 401 });
  }
  const token = await signSession(await userToSession(user));
  const cookie = sessionCookie(token);
  const response = NextResponse.json({
    ok: true,
    mustChangePassword: user.mustChangePassword,
    redirect: user.mustChangePassword ? "/admin/change-password" : "/admin",
  });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
