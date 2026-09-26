export interface Retreat {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  dates: string;
  location: string;
  duration: string;
  spotsRemaining: number;
  price: string;
  featuredImage: string;
  category: 'silent' | 'intensive' | 'restorative' | 'seasonal';
  highlights: string[];
  itinerary: {
    day: string;
    title: string;
    schedule: string[];
  }[];
  instructor: {
    name: string;
    role: string;
    bio: string;
    avatar: string;
  };
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Structured / HTML-ready for future WordPress content.rendered
  publishedAt: string;
  readingTime: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featuredImage: string;
  tags: string[];
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  category: string;
  description: string;
  rsvpUrl?: string;
  capacity?: string;
}

export interface PracticeFeature {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  iconName: string;
}
