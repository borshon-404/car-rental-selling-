import { NextResponse } from "next/server";
import { assertSameOrigin, readSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/content";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cars = await prisma.car.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(cars);
}

export async function POST(request: Request) {
  try { assertSameOrigin(request); } catch { return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 }); }
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "JSON body required." }, { status: 400 });
  const make = String(body.make || "Car");
  const model = String(body.model || "Model");
  const year = Number(body.year || new Date().getFullYear());
  const slug = slugify(String(body.slug || `${make}-${model}-${year}`)) || `car-${Date.now()}`;
  const features = Array.isArray(body.features) ? body.features : String(body.features || "").split(",").map((item) => item.trim()).filter(Boolean);
  const images = Array.isArray(body.images) ? body.images : String(body.images || body.image || "").split(",").map((item) => item.trim()).filter(Boolean);
  const car = await prisma.car.create({
    data: {
      slug,
      make,
      model,
      year,
      type: String(body.type || "Sedan"),
      segment: String(body.segment || ""),
      seats: Number(body.seats || 5),
      transmission: String(body.transmission || "Automatic"),
      fuel: String(body.fuel || "Petrol"),
      engine: String(body.engine || ""),
      color: String(body.color || ""),
      luggage: String(body.luggage || ""),
      rentalRate: Number(body.rentalRate || 0),
      salePrice: Number(body.salePrice || 0),
      mileageKm: Number(body.mileageKm || 0),
      availability: String(body.availability || "available"),
      focus: String(body.focus || "rental"),
      features: JSON.stringify(features),
      description: String(body.description || ""),
      image: String(body.image || images[0] || ""),
      images: JSON.stringify(images),
      published: body.published !== false,
    },
  });
  return NextResponse.json(car, { status: 201 });
}
