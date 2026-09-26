import { Event } from "@/types";
import { EVENTS } from "@/data/events";
import { fetchWP, decodeHtmlEntities, stripHtml, formatWpDate } from "./client";

export interface WpCourseItem {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt?: { rendered: string };
  link: string;
}

/**
 * Normalize raw WordPress Course/Workshop into frontend Event model
 */
export function normalizeWpCourse(item: WpCourseItem, index: number = 0): Event {
  const title = decodeHtmlEntities(item.title?.rendered || "Still Mountain Course / Masterclass");
  const rawContent = item.content?.rendered || item.excerpt?.rendered || "";
  const cleanDescription =
    decodeHtmlEntities(stripHtml(rawContent)) ||
    "An in-depth experiential masterclass and educational study with Still Mountain resident and visiting teachers.";

  return {
    id: String(item.id),
    slug: item.slug,
    title,
    date: formatWpDate(item.date) || "Upcoming 2026 / 2027",
    time: "07:00 – 08:30 AM (PT / IST)",
    location: "Global Online Sanctuary (Zoom Live Broadcast)",
    isOnline: true,
    category: "Online Course & Workshop",
    description: cleanDescription,
    rsvpUrl: item.link || "/contact",
    capacity: "Limited to 50 Live Attendees",
  };
}

/**
 * Fetch events/courses from WordPress REST API (/wp/v2/course?_embed=1)
 */
export async function getEvents(options: { limit?: number } = {}): Promise<Event[]> {
  const limit = options.limit || 10;
  const wpCourses = await fetchWP<WpCourseItem[]>("/course", {
    _embed: 1,
    per_page: limit,
    status: "publish",
  });

  if (!wpCourses || !Array.isArray(wpCourses) || wpCourses.length === 0) {
    return options.limit ? EVENTS.slice(0, options.limit) : EVENTS;
  }

  return wpCourses.map((c, idx) => normalizeWpCourse(c, idx));
}
