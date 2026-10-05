import type { Metadata, Viewport } from "next";
// Self-hosted Roboto 300/400/500/700 — identical family and weights to the
// design source zip, which loaded them from Google Fonts in public/index.html.
// @fontsource ships the woff2 files with the package so there is no
// render-blocking request and no build-time network dependency.
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@/styles/globals.css";
import { SITE } from "@/data/site";
import LoadingScreen from "@/components/chrome/LoadingScreen";
import CookieConsent from "@/components/chrome/CookieConsent";
import Providers from "@/components/Providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // manifest.json / index.html theme-color from the design source
  themeColor: "#17c1e8",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "business intelligence Kenya",
    "data analytics Nairobi",
    "predictive modelling East Africa",
    "SaaS dashboard Kenya",
    "M-Pesa analytics",
    "WhatsApp business reports",
    "NGO impact dashboard",
    "school performance tracker Kenya",
    "hotel occupancy forecasting",
  ],
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: "/og/default.png", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/og/default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false },
};

/** SoftwareApplication + WebApplication JSON-LD (brief: Vercel deployment §SEO). */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE.url}/#software`,
      name: SITE.name,
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Business Intelligence",
      operatingSystem: "Web",
      description: SITE.description,
      url: SITE.url,
      softwareVersion: "1.0",
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "2999",
          priceCurrency: "KES",
          category: "Subscription",
        },
        {
          "@type": "Offer",
          name: "Business",
          price: "7999",
          priceCurrency: "KES",
          category: "Subscription",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "126",
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE.url}/#webapp`,
      name: SITE.name,
      url: SITE.url,
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      applicationCategory: "BusinessApplication",
      featureList: [
        "Real-time revenue dashboard",
        "Sales forecasting",
        "Customer churn prediction",
        "Inventory stockout prediction",
        "WhatsApp report delivery",
        "Custom report builder",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.legalName,
      url: SITE.url,
      email: SITE.email,
      telephone: `+${SITE.phone}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Chania Avenue, Kilimani",
        addressLocality: "Nairobi",
        addressCountry: "KE",
      },
      areaServed: ["KE", "UG", "TZ", "RW", "ET"],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a className="dp-skip-link" href="#main">
          Skip to main content
        </a>
        <LoadingScreen />
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
