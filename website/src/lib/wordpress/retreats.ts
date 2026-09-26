import { Retreat } from "@/types";
import { RETREATS } from "@/data/retreats";
import { fetchWP, decodeHtmlEntities, stripHtml } from "./client";

export interface WpRetreatItem {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  retreat_category?: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      id: number;
      source_url: string;
      alt_text?: string;
    }>;
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
}

const DEFAULT_RETREAT_IMAGES = [
  "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80",
];

const DEFAULT_FACULTY = [
  {
    name: "Swami Jnaneshvara & Resident Guides",
    role: "Himalayan Tradition Meditation & Pranayama Guides",
    bio: "Dedicated monastic disciples trained in the classical Himalayan tradition, guiding sincere practitioners in breath ratios and internal witness meditation.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Acharya Dev & Resident Sadhakas",
    role: "Ayurveda & Breathwork Facilitator",
    bio: "Guiding somatic nervous regulation, classical pranayama sadhana, and noble silence protocols.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
];

const DEFAULT_HIGHLIGHTS = [
  "Noble Silence (Mauna) practice intervals",
  "Daily Guided Classical 6-Stage Pranayama",
  "Deep Yoga Nidra & Cellular Relaxation",
  "Organic Sattvic Himalayan Nutrition",
  "Sound Immersion & Vedic Mantra Chanting",
  "Personalized 1-on-1 Practice Review",
];

const DEFAULT_ITINERARY = [
  {
    day: "Day 1",
    title: "Arrival, Grounding & Foundation",
    schedule: [
      "03:00 PM — Arrival, Check-in & Herbal Tea",
      "05:00 PM — Orientation & Opening Pranayama",
      "06:30 PM — Sattvic Dinner & Welcome Circle",
      "08:00 PM — Yoga Nidra & Gentle Rest",
    ],
  },
  {
    day: "Day 2",
    title: "Immersion & The Witness Breath",
    schedule: [
      "06:00 AM — Morning Chanting & Silent Breath Ratios",
      "08:00 AM — Nourishing Breakfast & Walking Meditation",
      "10:30 AM — Advanced Kumbhaka (Breath Retention) Workshop",
      "01:00 PM — Farm-to-Table Lunch & Silence",
      "04:30 PM — Nadi Shodhana & Somatic Breath Exploration",
      "07:30 PM — Evening Sound Sanctuary & Sleep Meditation",
    ],
  },
  {
    day: "Day 3 & Onward",
    title: "Integration, Stillness & Departure",
    schedule: [
      "06:00 AM — Sunrise Pranayama Sadhana",
      "08:30 AM — Sattvic Breakfast & Circle of Reflection",
      "10:30 AM — Integration Guide for Daily Home Sadhana",
      "12:00 PM — Final Blessings & Departure",
    ],
  },
];

/**
 * Normalize raw WordPress Retreat into frontend Retreat model
 */
export function normalizeWpRetreat(item: WpRetreatItem, index: number = 0): Retreat {
  const mediaObj = item._embedded?.["wp:featuredmedia"]?.[0];
  const terms = item._embedded?.["wp:term"] || [];
  const categoryTerm = terms.flat().find((t) => t.taxonomy === "retreat_category");

  const featuredImage =
    mediaObj?.source_url ||
    DEFAULT_RETREAT_IMAGES[index % DEFAULT_RETREAT_IMAGES.length];

  const title = decodeHtmlEntities(item.title?.rendered || "Still Mountain Retreat");
  const rawExcerpt = item.excerpt?.rendered || "";
  const rawContent = item.content?.rendered || "";

  const cleanDescription =
    decodeHtmlEntities(stripHtml(rawContent)) ||
    decodeHtmlEntities(stripHtml(rawExcerpt)) ||
    "An immersive multi-day sanctuary retreat designed for sincere practitioners seeking to deepen their pranayama practice, cultivate noble silence (mauna), and experience revitalizing rest.";

  const tagline =
    decodeHtmlEntities(stripHtml(rawExcerpt)) ||
    "An immersive journey into breath, silence, and cellular renewal.";

  const instructor = DEFAULT_FACULTY[index % DEFAULT_FACULTY.length];

  return {
    id: String(item.id),
    slug: item.slug,
    title,
    tagline,
    description: cleanDescription,
    dates: "Upcoming 2026 / 2027",
    location: "Still Mountain Sanctuary, California / Himalayas",
    duration: "4 - 7 Days",
    spotsRemaining: 4 + (index % 5),
    price: "$1,250 – $2,400",
    featuredImage,
    category: (categoryTerm?.slug as any) || "intensive",
    highlights: DEFAULT_HIGHLIGHTS,
    itinerary: DEFAULT_ITINERARY,
    instructor,
  };
}

/**
 * Fetch retreats from WordPress REST API (/wp/v2/retreat?_embed=1)
 */
export async function getRetreats(options: { limit?: number } = {}): Promise<Retreat[]> {
  const limit = options.limit || 10;
  // Notice: The live WordPress REST base on smwr.org is `/retreat`
  const wpRetreats = await fetchWP<WpRetreatItem[]>("/retreat", {
    _embed: 1,
    per_page: limit,
    status: "publish",
  });

  if (!wpRetreats || !Array.isArray(wpRetreats) || wpRetreats.length === 0) {
    return options.limit ? RETREATS.slice(0, options.limit) : RETREATS;
  }

  return wpRetreats.map((r, idx) => normalizeWpRetreat(r, idx));
}

/**
 * Fetch a single retreat by slug from WordPress REST API (/wp/v2/retreat?slug=...&_embed=1)
 */
export async function getRetreatBySlug(slug: string): Promise<Retreat | null> {
  const wpRetreats = await fetchWP<WpRetreatItem[]>("/retreat", {
    slug,
    _embed: 1,
    per_page: 1,
  });

  if (wpRetreats && Array.isArray(wpRetreats) && wpRetreats.length > 0) {
    return normalizeWpRetreat(wpRetreats[0], 0);
  }

  // Fallback to local mock data if matches slug
  const fallback = RETREATS.find((r) => r.slug === slug);
  return fallback || null;
}
