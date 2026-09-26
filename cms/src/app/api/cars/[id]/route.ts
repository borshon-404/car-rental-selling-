import { NextResponse } from "next/server";
import { assertSameOrigin, readSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/content";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try { assertSameOrigin(request); } catch { return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 }); }
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "JSON body required." }, { status: 400 });
  const current = await prisma.car.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const features = body.features === undefined ? current.features : JSON.stringify(Array.isArray(body.features) ? body.features : String(body.features).split(",").map((item) => item.trim()).filter(Boolean));
  const images = body.images === undefined && body.image === undefined
    ? current.images
    : JSON.stringify(Array.isArray(body.images) ? body.images : String(body.images || body.image || "").split(",").map((item) => item.trim()).filter(Boolean));
  const car = await prisma.car.update({
    where: { id },
    data: {
      slug: slugify(String(body.slug || current.slug)) || current.slug,
      make: String(body.make ?? current.make),
      model: String(body.model ?? current.model),
      year: Number(body.year ?? current.year),
      type: String(body.type ?? current.type),
      segment: String(body.segment ?? current.segment),
      seats: Number(body.seats ?? current.seats),
      transmission: String(body.transmission ?? current.transmission),
      fuel: String(body.fuel ?? current.fuel),
      engine: String(body.engine ?? current.engine),
      color: String(body.color ?? current.color),
      luggage: String(body.luggage ?? current.luggage),
      rentalRate: Number(body.rentalRate ?? current.rentalRate),
      salePrice: Number(body.salePrice ?? current.salePrice),
      mileageKm: Number(body.mileageKm ?? current.mileageKm),
      availability: String(body.availability ?? current.availability),
      focus: String(body.focus ?? current.focus),
      features,
      description: String(body.description ?? current.description),
      image: String(body.image ?? current.image),
      images,
      published: body.published === undefined ? current.published : Boolean(body.published),
    },
  });
  return NextResponse.json(car);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try { assertSameOrigin(request); } catch { return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 }); }
  const session = await readSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Only an admin can delete." }, { status: 403 });
  const { id } = await context.params;
  await prisma.car.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
