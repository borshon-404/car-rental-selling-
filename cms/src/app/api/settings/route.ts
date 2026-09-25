import { NextResponse } from "next/server";
import { assertSameOrigin, readSession } from "@/lib/auth";
import { publicSettings, saveSettings } from "@/lib/settings";

const ALLOWED = [
  "site_name",
  "site_url",
  "ga_measurement_id",
  "ga_enabled",
  "gsc_verification_token",
  "gsc_method",
  "robots_extra",
  "revalidate_seconds",
  "smtp_host",
  "smtp_port",
  "smtp_secure",
  "smtp_user",
  "smtp_password",
  "smtp_from",
] as const;

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await publicSettings());
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  const session = await readSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Only an admin can change settings." }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "JSON body required." }, { status: 400 });
  const patch: Record<string, string> = {};
  for (const key of ALLOWED) {
    if (body[key] !== undefined) patch[key] = String(body[key] ?? "");
  }
  if (patch.ga_measurement_id && !/^G-[A-Z0-9]+$/i.test(patch.ga_measurement_id) && patch.ga_measurement_id !== "") {
    return NextResponse.json({ error: "Measurement ID should look like G-XXXXXXXX." }, { status: 400 });
  }
  await saveSettings(patch);
  return NextResponse.json({ ok: true, settings: await publicSettings() });
}
