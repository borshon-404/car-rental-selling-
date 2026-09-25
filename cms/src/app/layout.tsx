import type { Metadata } from "next";
import "./globals.css";
import { publicSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await publicSettings();
  return {
    metadataBase: new URL(settings.siteUrl),
    title: { default: settings.siteName, template: `%s · ${settings.siteName}` },
    description: "Car rental and sales content managed from the Daulat CMS admin.",
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await publicSettings();
  return (
    <html lang="en">
      <head>
        {settings.gscToken && settings.gscMethod !== "file" ? (
          <meta name="google-site-verification" content={settings.gscToken} />
        ) : null}
        {settings.gaEnabled && /^G-[A-Z0-9]+$/i.test(settings.gaId) ? (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" />
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.gaId}',{anonymize_ip:true});`,
              }}
            />
          </>
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
