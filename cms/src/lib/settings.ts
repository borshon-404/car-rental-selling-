import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { prisma } from "./db";

const SECRET_KEYS = new Set(["smtp_password"]);

function key() {
  const raw = process.env.SETTINGS_SECRET || process.env.AUTH_SECRET || "";
  if (raw.length < 32) throw new Error("SETTINGS_SECRET must be at least 32 characters.");
  return createHash("sha256").update(raw).digest();
}

export function encryptSecret(plain: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptSecret(value: string) {
  if (!value.startsWith("enc:")) return value;
  const [, ivB64, tagB64, dataB64] = value.split(":");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const plain = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return plain.toString("utf8");
}

export async function getSettings() {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function getSetting(name: string, fallback = "") {
  const row = await prisma.setting.findUnique({ where: { key: name } });
  if (!row) return fallback;
  return SECRET_KEYS.has(name) ? decryptSecret(row.value) : row.value;
}

export async function saveSettings(input: Record<string, string>) {
  for (const [name, value] of Object.entries(input)) {
    const stored = SECRET_KEYS.has(name) && value && value !== "********" ? encryptSecret(value) : value;
    if (SECRET_KEYS.has(name) && (value === "********" || value === "")) continue;
    await prisma.setting.upsert({
      where: { key: name },
      update: { value: stored },
      create: { key: name, value: stored },
    });
  }
}

export async function publicSettings() {
  const all = await getSettings();
  return {
    siteName: all.site_name || "Daulat Drive",
    siteUrl: all.site_url || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    gaId: all.ga_measurement_id || process.env.GA_MEASUREMENT_ID || "",
    gaEnabled: all.ga_enabled !== "false",
    gscToken: all.gsc_verification_token || process.env.GSC_VERIFICATION_TOKEN || "",
    gscMethod: all.gsc_method || "meta",
    robotsExtra: all.robots_extra || "",
    robots_extra: all.robots_extra || "",
    revalidateSeconds: Number(all.revalidate_seconds || 60),
    smtpHost: all.smtp_host || process.env.SMTP_HOST || "",
    smtpPort: all.smtp_port || process.env.SMTP_PORT || "587",
    smtpSecure: (all.smtp_secure || process.env.SMTP_SECURE || "false") === "true",
    smtpUser: all.smtp_user || process.env.SMTP_USER || "",
    smtpFrom: all.smtp_from || process.env.SMTP_FROM || "",
    smtpPasswordSet: Boolean(all.smtp_password || process.env.SMTP_PASSWORD),
  };
}

export async function smtpConfig() {
  const all = await getSettings();
  const password = all.smtp_password
    ? decryptSecret(all.smtp_password)
    : process.env.SMTP_PASSWORD || "";
  return {
    host: all.smtp_host || process.env.SMTP_HOST || "",
    port: Number(all.smtp_port || process.env.SMTP_PORT || 587),
    secure: (all.smtp_secure || process.env.SMTP_SECURE || "false") === "true",
    user: all.smtp_user || process.env.SMTP_USER || "",
    password,
    from: all.smtp_from || process.env.SMTP_FROM || "Daulat Drive <mail@gmail.com>",
  };
}
