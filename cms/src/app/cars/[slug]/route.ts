import { prisma } from "@/lib/db";
import { publishedCars, toPublicCar } from "@/lib/cars";
import { carPageHtml } from "@/lib/site-html";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const row = await prisma.car.findUnique({ where: { slug } });
  if (!row || !row.published) {
    return new Response("That car is not listed. Call +8801330132141.", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  const car = toPublicCar(row);
  const others = (await publishedCars()).filter((item) => item.slug !== car.slug).slice(0, 4);
  const html = carPageHtml(car, others.map((item) => ({
    slug: item.slug,
    make: item.make,
    model: item.model,
    year: item.year,
    rental_rate_per_day: item.rental_rate_per_day,
    image: item.images[0] || "",
  })));
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
