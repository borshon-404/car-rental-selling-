import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/auth";

const schema = z.object({
  intent: z.string().optional(),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(6).max(40),
  car: z.string().optional(),
  car_name: z.string().optional(),
  pickup_location: z.string().optional(),
  pickup: z.string().optional(),
  pickup_time: z.string().optional(),
  return: z.string().optional(),
  return_time: z.string().optional(),
  days: z.number().optional(),
  driver: z.boolean().optional(),
  estimated_total_bdt: z.number().optional(),
  message: z.string().max(2000).optional(),
  _gotcha: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(`booking:${ip}`, 12, 15 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests. Call +8801330132141." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the name, email, and phone." }, { status: 400 });
  if (parsed.data._gotcha) return NextResponse.json({ ok: true });
  const data = parsed.data;
  const booking = await prisma.booking.create({
    data: {
      intent: data.intent === "sale" || data.intent === "contact" ? data.intent : "rent",
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      carSlug: data.car || "",
      carName: data.car_name || data.car || "",
      pickupLocation: data.pickup_location || "",
      pickupDate: data.pickup || "",
      pickupTime: data.pickup_time || "",
      returnDate: data.return || "",
      returnTime: data.return_time || "",
      days: Number(data.days || 0),
      driver: Boolean(data.driver),
      estimatedTotal: Math.round(Number(data.estimated_total_bdt || 0)),
      message: data.message || "",
      status: "new",
    },
  });
  return NextResponse.json({ ok: true, id: booking.id }, { status: 201 });
}
