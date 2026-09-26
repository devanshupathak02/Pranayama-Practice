export const siteConfig = {
  name: "Still Mountain Pranayama",
  shortName: "Pranayama",
  description: "A sanctuary for daily breathwork, classical pranayama sequences, deep yoga nidra, and immersive retreats.",
  tagline: "Breath. Silence. Presence.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://pranayama.smwr.org",
  
  // Configurable PWA link — does not hardcode domains
  pwaUrl: process.env.NEXT_PUBLIC_PWA_URL || "http://localhost:8081",
  
  // Configurable WordPress / Parent Organization website link
  orgUrl: process.env.NEXT_PUBLIC_ORG_URL || "https://smwr.org",
  
  // Configurable WordPress REST API endpoint
  wordpressUrl: process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://smwr.org/wp-json/wp/v2",
  
  mainNav: [
    { title: "Home", href: "/" },
    { title: "About", href: "/about" },
    { title: "Retreats", href: "/retreats" },
    { title: "Journal", href: "/journal" },
    { title: "Events", href: "/events" },
    { title: "Contact", href: "/contact" },
  ],
  
  socials: {
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
  },
  
  contact: {
    email: "practice@smwr.org",
    location: "Still Mountain Ashram & Sanctuary",
    hours: "Morning Practice: 06:00 - 08:30 IST",
  }
};
