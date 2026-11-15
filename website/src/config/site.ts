const isDev = process.env.NODE_ENV === "development";
const defaultAppUrl = isDev ? "/practice" : "https://app.pranayamatimes.org";

/**
 * Resolves the destination for the Timer App:
 * - In local testing (localhost / 127.0.0.1 / development / preview URLs): returns "/practice"
 * - In production (pranayamatimes.org): returns "https://app.pranayamatimes.org"
 */
export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    const h = window.location.hostname.toLowerCase();
    if (h === "localhost" || h === "127.0.0.1" || h.endsWith(".local") || h.includes("vercel.app")) {
      return "/practice";
    }
  }
  return process.env.NEXT_PUBLIC_APP_URL || defaultAppUrl;
}

export const siteConfig = {
  name: "Pranayama Times",
  shortName: "Pranayama",
  tagline: "Find Your Stillness, One Breath at a Time",
  description:
    "Explore the ancient practice of pranayama, deepen your understanding of conscious breathing, and create space for calm in everyday life.",
  url: process.env.NEXT_PUBLIC_SITE_URL || (isDev ? "http://localhost:3000" : "https://pranayamatimes.org"),

  // Dedicated Timer PWA Subdomain
  appUrl: process.env.NEXT_PUBLIC_APP_URL || defaultAppUrl,

  // Direct practice launcher or external PWA endpoint
  pwaUrl: process.env.NEXT_PUBLIC_APP_URL || defaultAppUrl,

  // Parent organization website link
  orgUrl: process.env.NEXT_PUBLIC_ORG_URL || "https://smwr.org",

  // WordPress REST API endpoint
  wordpressUrl:
    process.env.WORDPRESS_URL ||
    process.env.NEXT_PUBLIC_WORDPRESS_URL ||
    "https://smwr.org/wp-json/wp/v2",

  mainNav: [
    { title: "Home", href: "/" },
    { title: "Learn", href: "/learn" },
    { title: "Journal", href: "/journal" },
    { title: "Pranayama Timer", href: "/practice", isAppCta: true },
    { title: "About SMWR", href: "/about" },
  ],

  footerNav: {
    platform: [
      { title: "Home", href: "/" },
      { title: "Learn Pranayama", href: "/learn" },
      { title: "Journal & Essays", href: "/journal" },
      { title: "Pranayama Timer", href: process.env.NEXT_PUBLIC_APP_URL || "https://app.pranayamatimes.org", external: true },
    ],
    sanctuary: [
      { title: "About SMWR", href: "/about" },
      { title: "Still Mountain Retreats", href: "https://smwr.org", external: true },
      { title: "Ashram Lineage", href: "https://smwr.org", external: true },
    ],
    legal: [
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Use", href: "/terms" },
      { title: "Contact", href: "/contact" },
    ],
  },

  contact: {
    email: "practice@smwr.org",
    location: "Still Mountain Ashram & Sanctuary",
    hours: "Morning Practice: 06:00 - 08:30 IST",
  },
};
