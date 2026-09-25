import { NextResponse } from "next/server";
import { getSetting } from "@/lib/settings";

/** Serves the HTML-file verification method. Rewritten from /googleXXXX.html */
export async function GET(request: Request) {
  const token = (await getSetting("gsc_verification_token")) || process.env.GSC_VERIFICATION_TOKEN || "";
  const file = new URL(request.url).searchParams.get("file") || "";
  const path = new URL(request.headers.get("x-middleware-rewrite") || request.url).pathname;
  const requested = file || path.split("/").pop() || "";
  if (!token || (requested && requested.replace(/\.html$/, "") !== token && requested !== `${token}.html` && !requested.includes(token))) {
    if (!token) return new NextResponse("Verification token is not set.", { status: 404 });
  }
  const name = token.endsWith(".html") ? token : `${token}.html`;
  return new NextResponse(`google-site-verification: ${name}\n`, {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}
