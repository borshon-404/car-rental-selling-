export function articleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    image: input.image || undefined,
    datePublished: input.datePublished,
    author: { "@type": "Person", name: input.author || "Daulat Drive" },
    mainEntityOfPage: input.url,
  };
}

export function productJsonLd(input: {
  name: string;
  description: string;
  url: string;
  image?: string;
  price: string;
  currency: string;
  sku?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    image: input.image || undefined,
    sku: input.sku || undefined,
    offers: {
      "@type": "Offer",
      url: input.url,
      priceCurrency: input.currency,
      price: input.price,
      availability: "https://schema.org/InStock",
    },
  };
}

export function localBusinessJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: "Daulat Drive",
    url: siteUrl,
    telephone: "+8801330132141",
    email: "mail@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Daulatpur",
      addressLocality: "Khulna",
      postalCode: "9202",
      addressCountry: "BD",
    },
  };
}
