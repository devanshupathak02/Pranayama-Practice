import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PwaManager } from "@/components/PwaManager";
import { PwaManifestLink } from "@/components/pwa/PwaManifestLink";
import { InstallProvider } from "@/components/pwa/InstallContext";
import { InstallOnboardingModal } from "@/components/pwa/InstallOnboardingModal";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#263F35",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Pranayama",
    "Pranayama Timer",
    "Conscious Breathing",
    "Still Mountain Wellness Retreat",
    "SMWR",
    "Breathwork Journal",
    "Kumbhaka",
    "Anulom Vilom",
    "Kapalbhati",
    "Ujjayi",
    "Bhramari",
    "Yoga Nidra",
    "Himalayan Yoga Lineage",
  ],
  authors: [{ name: "Still Mountain Wellness Retreat", url: siteConfig.orgUrl }],
  creator: "Still Mountain Wellness Retreat",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: "Still Mountain Pranayama Platform",
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: "Still Mountain Wellness Retreat",
      url: siteConfig.orgUrl,
      logo: `${siteConfig.url}/images/still-mountain-logo.png`,
    },
  };

  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full antialiased scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Dynamic manifest link strictly injected only on app subdomain */}
        <PwaManifestLink />
      </head>
      <body className="min-h-full flex flex-col bg-[#EDE8DC] text-[#263F35] selection:bg-[#82947A] selection:text-[#FAF7F2]">
        <InstallProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <PwaManager />
          <InstallOnboardingModal />
        </InstallProvider>
      </body>
    </html>
  );
}
