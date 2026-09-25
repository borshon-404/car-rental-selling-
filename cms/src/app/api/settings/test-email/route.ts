import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { assertSameOrigin, readSession } from "@/lib/auth";
import { smtpConfig } from "@/lib/settings";

const schema = z.object({ to: z.string().email() });

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  const session = await readSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid recipient email." }, { status: 400 });

  const smtp = await smtpConfig();
  if (!smtp.host || !smtp.from) {
    return NextResponse.json(
      { ok: false, error: "SMTP host and from-address are required before a test can be sent." },
      { status: 400 },
    );
  }
  try {
    const transport = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.user ? { user: smtp.user, pass: smtp.password } : undefined,
    });
    await transport.verify();
    const info = await transport.sendMail({
      from: smtp.from,
      to: parsed.data.to,
      subject: "Daulat CMS SMTP test",
      text: "This is a test message from the Daulat Drive admin panel. SMTP is configured.",
    });
    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SMTP send failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
