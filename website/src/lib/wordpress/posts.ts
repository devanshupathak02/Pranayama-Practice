import { Article } from "@/types";
import { ARTICLES } from "@/data/articles";
import { fetchWP, decodeHtmlEntities, stripHtml, calculateReadingTime, formatWpDate } from "./client";

export interface WpPostItem {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  _embedded?: {
    author?: Array<{
      id: number;
      name: string;
      description?: string;
      avatar_urls?: Record<string, string>;
    }>;
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

const DEFAULT_ARTICLE_IMAGES = [
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&w=1200&q=80",
];

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
];

// Topics explicitly excluded from Still Mountain Pranayama editorial publication
const EXCLUDED_TOPIC_REGEX = /\b(fertility|infertility|conception|pregnancy|sexual|libido|aphrodisiac|vajikarana|erectile|postpartum|pcos|menstrual)\b/i;

/**
 * Clean & validate author name — prevents email addresses, usernames, or admin handles
 */
function sanitizeAuthorName(rawName?: string): string {
  if (!rawName) return "Still Mountain Editorial Faculty";
  const trimmed = rawName.trim();
  if (
    trimmed.includes("@") ||
    /^\d+$/.test(trimmed) ||
    trimmed.toLowerCase() === "admin" ||
    trimmed.toLowerCase() === "root" ||
    trimmed.length < 2
  ) {
    return "Still Mountain Editorial Faculty";
  }
  return decodeHtmlEntities(trimmed);
}

/**
 * Normalize raw WordPress Post into frontend Article model with strict editorial checks
 */
export function normalizeWpPost(item: WpPostItem, index: number = 0): Article {
  const authorObj = item._embedded?.author?.[0];
  const mediaObj = item._embedded?.["wp:featuredmedia"]?.[0];
  const terms = item._embedded?.["wp:term"] || [];

  // Extract categories & tags from wp:term
  const categoryTerm = terms.flat().find((t) => t.taxonomy === "category");
  const tagTerms = terms.flat().filter((t) => t.taxonomy === "post_tag");

  const categoryName = categoryTerm
    ? decodeHtmlEntities(categoryTerm.name)
    : "Breath Science";

  const tags = tagTerms.length > 0
    ? tagTerms.map((t) => decodeHtmlEntities(t.name).toLowerCase())
    : ["pranayama", "stillness", "breathwork"];

  // Image resolution: WP featured media -> Default curated meditation visual
  const featuredImage =
    mediaObj?.source_url ||
    DEFAULT_ARTICLE_IMAGES[index % DEFAULT_ARTICLE_IMAGES.length];

  // Author resolution with email protection
  const authorName = sanitizeAuthorName(authorObj?.name);
  const avatarUrl =
    authorObj?.avatar_urls?.["96"] ||
    authorObj?.avatar_urls?.["48"] ||
    DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];

  const rawExcerpt = item.excerpt?.rendered || "";
  const rawContent = item.content?.rendered || "";

  let publishedAt = formatWpDate(item.date);
  if (!publishedAt || publishedAt === "Invalid Date") {
    publishedAt = "Recent Publication";
  }

  return {
    id: String(item.id),
    slug: item.slug,
    title: decodeHtmlEntities(item.title?.rendered || "Untitled Article"),
    excerpt: decodeHtmlEntities(stripHtml(rawExcerpt)) || "Read this essay from Still Mountain Sanctuary.",
    content: rawContent || `<p>${decodeHtmlEntities(stripHtml(rawExcerpt))}</p>`,
    publishedAt,
    readingTime: calculateReadingTime(rawContent || rawExcerpt),
    category: categoryName,
    author: {
      name: authorName,
      role: "Still Mountain Faculty",
      avatar: avatarUrl,
    },
    featuredImage,
    tags,
  };
}

/**
 * Filter WordPress posts to retain only breathing, pranayama, meditation, philosophy, and rest topics.
 */
function isPranayamaFocused(post: WpPostItem): boolean {
  const title = post.title?.rendered || "";
  const slug = post.slug || "";
  const excerpt = post.excerpt?.rendered || "";
  const textToCheck = `${title} ${slug} ${excerpt}`;

  // Reject explicitly excluded subjects
  if (EXCLUDED_TOPIC_REGEX.test(textToCheck)) {
    return false;
  }

  return true;
}

/**
 * Fetch list of published posts from WordPress REST API (/wp/v2/posts?_embed=1)
 */
export async function getPosts(options: { limit?: number; category?: string } = {}): Promise<Article[]> {
  const limit = options.limit || 12;
  const wpPosts = await fetchWP<WpPostItem[]>("/posts", {
    _embed: 1,
    per_page: Math.max(limit * 2, 20),
    status: "publish",
  });

  if (!wpPosts || !Array.isArray(wpPosts) || wpPosts.length === 0) {
    // Fallback to authentic local articles if WordPress is unavailable
    return options.limit ? ARTICLES.slice(0, options.limit) : ARTICLES;
  }

  // Filter out unrelated imported content (fertility, sexual wellness, unrelated Ayurveda)
  const filteredWp = wpPosts.filter(isPranayamaFocused);
  const normalizedWp = filteredWp.map((post, idx) => normalizeWpPost(post, idx));

  // Merge with our verified authentic articles to guarantee rich content
  const seenSlugs = new Set<string>();
  const combined: Article[] = [];

  for (const article of [...normalizedWp, ...ARTICLES]) {
    if (!seenSlugs.has(article.slug)) {
      seenSlugs.add(article.slug);
      combined.push(article);
    }
  }

  return options.limit ? combined.slice(0, options.limit) : combined;
}

/**
 * Fetch a single post by slug from WordPress REST API (/wp/v2/posts?slug=...&_embed=1)
 */
export async function getPostBySlug(slug: string): Promise<Article | null> {
  // First check local verified articles to ensure highest fidelity & safety copy
  const localMatch = ARTICLES.find((a: Article) => a.slug === slug);
  if (localMatch) {
    return localMatch;
  }

  const wpPosts = await fetchWP<WpPostItem[]>("/posts", {
    slug,
    _embed: 1,
    per_page: 1,
  });

  if (wpPosts && Array.isArray(wpPosts) && wpPosts.length > 0) {
    const post = wpPosts[0];
    if (isPranayamaFocused(post)) {
      return normalizeWpPost(post, 0);
    }
  }

  return null;
}
