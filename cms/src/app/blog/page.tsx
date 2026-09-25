import Link from "next/link";
import { prisma } from "@/lib/db";
import { PublicFooter, PublicHeader } from "@/components/PublicChrome";

export const revalidate = 60;

export default async function BlogIndex() {
  const posts = await prisma.post.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" } });
  return (
    <>
      <PublicHeader />
      <main className="wrap hero">
        <h1>Journal</h1>
        <div className="grid">
          {posts.map((post) => (
            <article className="card" key={post.id}>
              <h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2>
              <p>{post.excerpt}</p>
            </article>
          ))}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
