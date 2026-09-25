import { articleJsonLd, productJsonLd } from "@/lib/jsonld";

export function seoMetadata(input: {
  title: string;
  description: string;
  robots?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  siteUrl: string;
  path: string;
}) {
  const url = input.canonical || `${input.siteUrl.replace(/\/$/, "")}${input.path}`;
  const [index, follow] = (input.robots || "index,follow").split(",").map((part) => part.trim());
  return {
    title: input.title,
    description: input.description,
    robots: { index: index !== "noindex", follow: follow !== "nofollow" },
    alternates: { canonical: url },
    openGraph: {
      title: input.ogTitle || input.title,
      description: input.ogDescription || input.description,
      url,
      images: input.ogImage ? [input.ogImage] : undefined,
    },
  };
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export { articleJsonLd, productJsonLd };
