export interface PranayamaPractice {
  id: string;
  name: string;
  sanskritName: string;
  englishName: string;
  shortDescription: string;
  fullDescription: string;
  beginnerFriendly: boolean;
  difficulty: "Beginner" | "Intermediate" | "All Levels";
  durationMinutes: number;
  image: string;
  articleSlug?: string;
  focus: string;
  instructions: string[];
  contraindications?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
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

export interface PracticeFeature {
  id: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  iconName: string;
}

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
