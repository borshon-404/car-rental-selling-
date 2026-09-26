import { prisma } from "./db";

export type PublicCar = {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  type: string;
  segment: string;
  seats: number;
  transmission: string;
  fuel: string;
  engine: string;
  color: string;
  luggage: string;
  rental_rate_per_day: number;
  sale_price: number;
  mileage_km: number;
  availability_status: string;
  focus: string;
  features: string[];
  description: string;
  images: string[];
  local_images: string[];
};

function asList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
  }
}

export function toPublicCar(car: {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  type: string;
  segment: string;
  seats: number;
  transmission: string;
  fuel: string;
  engine: string;
  color: string;
  luggage: string;
  rentalRate: number;
  salePrice: number;
  mileageKm: number;
  availability: string;
  focus: string;
  features: string;
  description: string;
  image: string;
  images: string;
}): PublicCar {
  const images = asList(car.images);
  if (car.image && !images.includes(car.image)) images.unshift(car.image);
  return {
    id: car.id,
    slug: car.slug,
    make: car.make,
    model: car.model,
    year: car.year,
    type: car.type,
    segment: car.segment,
    seats: car.seats,
    transmission: car.transmission,
    fuel: car.fuel,
    engine: car.engine,
    color: car.color,
    luggage: car.luggage,
    rental_rate_per_day: car.rentalRate,
    sale_price: car.salePrice,
    mileage_km: car.mileageKm,
    availability_status: car.availability,
    focus: car.focus,
    features: asList(car.features),
    description: car.description,
    images,
    local_images: images,
  };
}

export async function publishedCars() {
  const rows = await prisma.car.findMany({ where: { published: true }, orderBy: { rentalRate: "asc" } });
  return rows.map(toPublicCar);
}
