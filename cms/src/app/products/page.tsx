import Link from "next/link";
import { prisma } from "@/lib/db";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";

export const revalidate = 60;

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ where: { status: "published" }, orderBy: { updatedAt: "desc" } });
  return (
    <>
      <PublicHeader />
      <main className="wrap hero">
        <h1>Products</h1>
        <div className="grid">
          {products.map((product) => (
            <article className="card" key={product.id}>
              {product.image ? <img src={product.image} alt="" /> : null}
              <h2><Link href={`/products/${product.slug}`}>{product.name}</Link></h2>
              <p>{(product.priceCents / 100).toLocaleString("en-BD")} {product.currency}</p>
            </article>
          ))}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
