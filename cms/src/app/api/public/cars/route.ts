import { NextResponse } from "next/server";
import { publishedCars } from "@/lib/cars";

export const dynamic = "force-dynamic";

export async function GET() {
  const cars = await publishedCars();
  return NextResponse.json(cars, { headers: { "cache-control": "no-store" } });
}
