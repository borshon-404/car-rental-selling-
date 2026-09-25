import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || process.argv[2] || "").toLowerCase();
  const password = process.env.ADMIN_TEMP_PASSWORD || process.argv[3] || "";
  if (!email.includes("@") || password.length < 12) {
    console.error("Usage: ADMIN_EMAIL=you@example.com ADMIN_TEMP_PASSWORD='at-least-12-chars' npm run create-admin");
    process.exit(1);
  }
  const passwordHash = await hash(password, 12);
  const role = process.env.ADMIN_ROLE === "editor" ? "editor" : "admin";
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, mustChangePassword: true, role },
    create: { email, name: role === "editor" ? "Editor" : "Temporary admin", passwordHash, mustChangePassword: true, role },
  });
  console.log(`Temporary admin ${email} must change this password on first login.`);
}

main().finally(() => prisma.$disconnect());
