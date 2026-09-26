import { siteConfig } from "@/config/site";

export const WORDPRESS_API_URL = siteConfig.wordpressUrl;

/**
 * Cleanly decode common HTML entities that WordPress REST API returns in rendered titles and excerpts.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&hellip;/g, "...")
    .replace(/\[&hellip;\]/g, "...")
    .replace(/&#8230;/g, "...")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/**
 * Strip HTML tags from a string (useful for clean excerpts and SEO meta descriptions)
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Calculate approximate reading time in minutes
 */
export function calculateReadingTime(html: string): string {
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/**
 * Format a WordPress ISO date string into a clean, human-readable date.
 */
export function formatWpDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Native server-side fetch wrapper for WordPress REST API with Next.js ISR revalidation.
 */
export async function fetchWP<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
  revalidate: number = 3600
): Promise<T | null> {
  try {
    const url = new URL(
      endpoint.startsWith("http") ? endpoint : `${WORDPRESS_API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`
    );

    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined) {
        url.searchParams.set(key, String(val));
      }
    });

    const res = await fetch(url.toString(), {
      next: { revalidate },
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`[WordPress API] HTTP ${res.status} error fetching ${url.toString()}`);
      return null;
    }

    const data: T = await res.json();
    return data;
  } catch (error: any) {
    console.warn(`[WordPress API] Network or fetch error for endpoint "${endpoint}":`, error?.message || error);
    return null;
  }
}
