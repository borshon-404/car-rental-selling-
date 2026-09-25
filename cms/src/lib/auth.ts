import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { compare, hash } from "bcryptjs";
import { prisma } from "./db";

export const COOKIE = "cms_session";

export type SessionUser = {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  mustChangePassword: boolean;
};

function secret() {
  const value = process.env.AUTH_SECRET || "";
  if (value.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters.");
  }
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function signSession(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}

export async function readSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role === "editor" ? "editor" : "admin",
      mustChangePassword: Boolean(payload.mustChangePassword),
    };
  } catch {
    return null;
  }
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    },
  };
}

export async function userToSession(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  mustChangePassword: boolean;
}): Promise<SessionUser> {
  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role === "editor" ? "editor" : "admin",
    mustChangePassword: user.mustChangePassword,
  };
}

export async function requireUser() {
  const session = await readSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return null;
  return userToSession(user);
}

const attempts = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 8, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const row = attempts.get(key);
  if (!row || row.reset < now) {
    attempts.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  row.count += 1;
  if (row.count > limit) return { ok: false, remaining: 0 };
  return { ok: true, remaining: limit - row.count };
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("host");
  try {
    const url = new URL(origin);
    if (host && url.host !== host) {
      throw new Error("Cross-origin request blocked.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cross-origin")) throw error;
  }
}
