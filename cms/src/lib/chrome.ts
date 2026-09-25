import { prisma } from "./db";

export type NavLink = { label: string; href: string };

export type HeaderData = {
  logoText: string;
  tagline: string;
  announcement: string;
  links: NavLink[];
};

export type FooterData = {
  blurb: string;
  phone: string;
  email: string;
  address: string;
  links: NavLink[];
};

export const defaultHeader: HeaderData = {
  logoText: "Daulat Drive",
  tagline: "CMS",
  announcement: "",
  links: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Products", href: "/products" },
    { label: "Portfolio", href: "/portfolio" },
  ],
};

export const defaultFooter: FooterData = {
  blurb: "Content for this site is edited in the admin panel.",
  phone: "+8801330132141",
  email: "mail@gmail.com",
  address: "Daulatpur, Khulna 9202, Bangladesh",
  links: [
    { label: "Admin", href: "/admin" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
};

export async function getChrome() {
  const row = await prisma.siteChrome.findUnique({ where: { id: "singleton" } });
  return {
    header: { ...defaultHeader, ...(row ? safeJson(row.headerJson) : {}) } as HeaderData,
    footer: { ...defaultFooter, ...(row ? safeJson(row.footerJson) : {}) } as FooterData,
  };
}

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
