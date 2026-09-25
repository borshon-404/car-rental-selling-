import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "cms_session";

async function session(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  const secret = process.env.AUTH_SECRET || "";
  if (!token || secret.length < 32) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isApi = pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/login") && !pathname.startsWith("/api/gsc-file");
  if (!isAdmin && !isApi) return NextResponse.next();

  const user = await session(request);
  const isLogin = pathname === "/admin/login";
  const isChange = pathname === "/admin/change-password" || pathname === "/api/auth/change-password";
  const isLogout = pathname === "/api/auth/logout";

  if (isLogin) {
    if (user && !user.mustChangePassword) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!user && (isAdmin || isApi)) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user?.mustChangePassword && !isChange && !isLogout && isAdmin) {
    return NextResponse.redirect(new URL("/admin/change-password", request.url));
  }

  if (user?.mustChangePassword && isApi && !isChange && !isLogout) {
    return NextResponse.json({ error: "Password change required." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/:path*"],
};
